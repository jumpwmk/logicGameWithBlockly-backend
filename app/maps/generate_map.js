import { slice_2d_array } from '../utils/utils';
import { basic_commands, reverse_basic_commands } from './basicCommands';
import { for_loop_commands } from './loopCommands';
import { if_else_tile_condition_commands_with_loop } from './decisionMakingCommands';

import { mapW_real, mapH_real, mapW, mapH } from '../config/constant';

const { PriorityQueue } = require('../utils/priority_queue');
const { UnionFind } = require('../utils/union_find');

let probs_of_actions = [0.4, 0.2, 0.2, 0, 0.2]; // 0: go ahead, 1: turn right, 2: turn left, 3: do action I, 4: do action II
let type_of_actions = 5;

function add_enemies(obj) {
  let { mapData, x, y } = obj;

  var direction = Math.floor(Math.random() * 4);
  var direction_to_word = ['xb', 'yf', 'xf', 'yb'];

  var enemies_type = 'bot';
  // var enemies_facing = direction_to_word[direction];
  var enemies_facing = 'xf';
  mapData.enemies[x][y] = { enemytype: enemies_type, facing: enemies_facing };
}

function add_floatingobj(obj) {
  var mapData = obj.mapData;
  var x = obj.x;
  var y = obj.y;
  var objtype = 'gem';
  var objvari = 1;
  mapData.floatingobj[x][y] = { objtype: objtype, objvari: objvari, visible: true };
}

function add_tileoverlay(obj) {
  var mapData = obj.mapData;
  var x = obj.x;
  var y = obj.y;
  var overlaytype = 1;
  mapData.tileoverlay[x][y] = { overlaytype: overlaytype };
}

function add_wall(obj) {
  var mapData = obj.mapData;
  var x = obj.x;
  var y = obj.y;
  var facing = obj.facing;
  var overlaytype = 1;

  mapData.wall[x][y][facing] = { walltype: overlaytype };
}

function remove_wall(obj) {
  var mapData = obj.mapData;
  var final = obj.final;
  if (final === undefined) final = true;

  var x = obj.x;
  var y = obj.y;
  var facing = obj.facing;
  // console.log('in remove wall function', x, y, facing, mapData.wall[x][y][facing]);
  if (mapData.wall[x][y][facing] === undefined) return true;
  // console.log(mapData.wall[x][y][facing]["permanent"]);
  if ('permanent' in mapData.wall[x][y][facing]) return false;
  delete mapData.wall[x][y][facing];
}

function build_permanent_wall(obj) {
  let { mapData, condition } = obj;

  let bot = mapData.bot;
  let word_to_direction = { ahead: 0, left: 3, right: 1 };
  let directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];
  let x = bot.x;
  let y = bot.y;
  let direction = bot.facing + word_to_direction[condition];
  let overlaytype = 1;

  mapData.wall[x][y][direction] = { walltype: overlaytype, permanent: true };
  x = x + directions[direction];
  y = y + directions[direction];
  direction = (direction + 2) % 4;
  if (x >= 0 && y >= 0 && x < mapW && y < mapH)
    mapData.wall[x][y][direction] = { walltype: overlaytype, permanent: true };
}

function init_mapData() {
  var direction = Math.floor(Math.random() * 4);
  var mapData = {
    start: { x: 25, y: 25, facing: direction },
    bot: { x: 25, y: 25, facing: direction, state: 1 },
    check: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    count: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    check_object: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(false)),
    platform: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    wall: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    enemies: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    tileoverlay: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    floatingobj: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    walloverlay: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    tiles: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0))
  };
  for (var i = 0; i < mapW_real; i++) {
    for (var j = 0; j < mapH_real; j++) {
      mapData.wall[i][j] = { 0: { walltype: 1 }, 1: { walltype: 1 }, 2: { walltype: 1 }, 3: { walltype: 1 } };
    }
  }
  mapData.platform[mapData.bot.x][mapData.bot.y] = 1;
  mapData.check_object[mapData.bot.x][mapData.bot.y] = true;
  mapData.count[mapData.bot.x][mapData.bot.y] = 1;
  return mapData;
}

function cal_position(x, y) {
  return x * mapH + y;
}

function generate_distraction(obj) {
  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];
  var mapData = obj.mapData;
  var number_of_distractions = obj.number_of_distractions;
  var pq = new PriorityQueue();
  var uf = new UnionFind(mapW * mapH);

  // console.log(mapData[0]);

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      for (var k = 0; k < 4; k++) {
        if (mapData.platform[i][j] === 1) {
          if (
            i + directions[k][0] < 0 ||
            i + directions[k][0] >= mapW ||
            j + directions[k][1] < 0 ||
            j + directions[k][1] >= mapH
          )
            continue;
          if (k in mapData.wall[i][j] && 'permanent' in mapData.wall[i][j][k]) continue;
          if (mapData.platform[i + directions[k][0]][j + directions[k][1]]) {
            uf.union(cal_position(i, j), cal_position(i + directions[k][0], j + directions[k][1]));
            if (k in mapData.wall[i][j]) {
              mapData.wall[i][j][k].permanent = true;
              mapData.wall[i + directions[k][0]][j + directions[k][1]][(k + 2) % 4].permanent = true;
            }
            continue;
          }
          if (k in mapData.wall[i][j]) pq.push({ x: i, y: j, dir: k }, Math.random());
        }
      }
    }
  }

  while (number_of_distractions-- && !pq.isEmpty()) {
    var obj = pq.pop().element;
    var x = obj.x,
      y = obj.y,
      dir = obj.dir;
    var pos1 = cal_position(x, y);
    var pos2 = cal_position(x + directions[dir][0], y + directions[dir][1]);

    var h1 = uf.find(pos1);
    var h2 = uf.find(pos2);

    if (h1 !== h2) {
      remove_wall({ x: x, y: y, mapData: mapData, facing: dir });

      uf.union(pos1, pos2);
      x = obj.x + directions[dir][0];
      y = obj.y + directions[dir][1];

      remove_wall({ x: x, y: y, mapData: mapData, facing: (dir + 2) % 4 });
      mapData.platform[x][y] = 1;

      for (var k = 0; k < 4; k++) {
        if (
          x + directions[k][0] < 0 ||
          x + directions[k][0] >= mapW ||
          y + directions[k][1] < 0 ||
          y + directions[k][1] >= mapH
        )
          continue;
        if (mapData.wall[x][y][k] === undefined || 'permanent' in mapData.wall[x][y][k]) continue;
        if (mapData.count[x + directions[k][0]][y + directions[k][1]]) {
          // console.log('create permanent wall', x + directions[k][0], y + directions[k][1]);
          mapData.wall[x][y][k].permanent = true;
          mapData.wall[x + directions[k][0]][y + directions[k][1]][(k + 2) % 4].permanent = true;
          continue;
        }
        if (mapData.platform[x][y]) continue;
        var x2 = x + directions[k][0];
        var y2 = y + directions[k][1];
        if (uf.find(cal_position(x2, y2)) !== uf.find(cal_position(x, y))) {
          pq.push({ x: x, y: y, dir: k }, Math.random());
        }
      }
    } else {
      console.log('cannot remove walls');
      mapData.wall[x][y][dir].permanent = true;
      mapData.wall[x + directions[dir][0]][y + directions[dir][1]][(dir + 2) % 4].permanent = true;
      number_of_distractions++;
    }
  }

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      for (var k = 0; k < 4; k++) {
        if (mapData.platform[i][j] === 1) {
          if (
            i + directions[k][0] < 0 ||
            i + directions[k][0] >= mapW ||
            j + directions[k][1] < 0 ||
            j + directions[k][1] >= mapH
          )
            continue;
          if (k in mapData.wall[i][j] && mapData.count[i][j]) {
            // console.log('create permanent at', i, j);
            mapData.wall[i][j][k].permanent = true;
            mapData.wall[i + directions[k][0]][j + directions[k][1]][(k + 2) % 4].permanent = true;
          }
        }
      }
    }
  }
}

function generate_map(obj) {
  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  var commands = obj.commands;
  var mapData = obj.mapData;
  var bot = obj.mapData.bot;
  var check = obj.mapData.check;
  var count = obj.mapData.count;
  const prop_walk = 0.6;

  var type = commands.type;

  if (type === 'basic') {
    commands = commands.commands;
    for (var i = 0; i < commands.length; i++) {
      check[bot.x][bot.y] = bot.state;
      mapData.platform[bot.x][bot.y] = 1;
      if (commands[i] instanceof Object) {
        if (generate_map({ commands: commands[i], mapData: mapData }) === false) return false;
      } else if (commands[i] === 0) {
        if (remove_wall({ x: bot.x, y: bot.y, mapData: mapData, facing: bot.facing }) === false) return false;
        bot.x = bot.x + directions[bot.facing][0];
        bot.y = bot.y + directions[bot.facing][1];
        if (bot.x < 0 || bot.x >= mapW_real || bot.y < 0 || bot.y >= mapH_real || check[bot.x][bot.y] === bot.state)
          return false;
        if (mapData.floatingobj[bot.x][bot.y] !== undefined) return false;
        if (mapData.tileoverlay[bot.x][bot.y] !== undefined) return false;
        check[bot.x][bot.y] = bot.state;
        count[bot.x][bot.y]++;
        if (remove_wall({ x: bot.x, y: bot.y, mapData: mapData, facing: (bot.facing + 2) % 4 }) === false) return false;
      } else if (commands[i] === 1) {
        bot.facing = (bot.facing + 1) % 4;
      } else if (commands[i] === 2) {
        bot.facing = (bot.facing + 3) % 4;
      } else if (commands[i] === 3) {
        if (mapData.check_object[bot.x][bot.y] === true || count[bot.x][bot.y] > 1) return false;
        mapData.check_object[bot.x][bot.y] = true;
        add_enemies({ x: bot.x, y: bot.y, mapData: mapData });
        bot.state += 1;
        check[bot.x][bot.y] = bot.state;
      } else if (commands[i] === 4) {
        if (mapData.check_object[bot.x][bot.y] === true || count[bot.x][bot.y] > 1) return false;
        mapData.check_object[bot.x][bot.y] = true;
        add_floatingobj({ x: bot.x, y: bot.y, mapData: mapData });
        bot.state += 1;
        check[bot.x][bot.y] = bot.state;
      }
    }
  } else if (type === 'for') {
    var iteration = commands.iteration;
    var tmp_commands = { ...commands };
    tmp_commands.type = 'basic';
    for (var loop = 0; loop < iteration; loop++) {
      if (generate_map({ commands: tmp_commands, mapData: mapData }) === false) return false;
    }
  } else if (type === 'if') {
    if (commands.condition.includes('on')) {
      // not done yet
      // if(commands.condition === "on red tile"){
      // }else if(commands.condition === "on grey tile"){
      // }
      if (Math.random() < prop_walk) {
        return true;
      }
      if (mapData.check_object[bot.x][bot.y] === true) return false;
      mapData.check_object[bot.x][bot.y] = true;
      var tmp_commands = { ...commands };
      tmp_commands.type = 'basic';
      add_tileoverlay({ mapData: mapData, x: bot.x, y: bot.y });
      if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
    } else {
      if (Math.random() < prop_walk) {
        build_permanent_wall({ mapData: mapData, condition: commands.condition });
        return true;
      }
      var tmp_commands = { ...commands };
      tmp_commands.type = 'basic';
      if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
    }
  } else if (type === 'if_else') {
    /// not done yet
    if (commands.condition.includes('on')) {
      // not done yet
      // if(commands.condition === "on red tile"){
      // }else if(commands.condition === "on grey tile"){
      // }
      if (Math.random() < prop_walk) {
        var tmp_commands = { ...commands.commands_else };
        if (generate_map({ commands: tmp_commands, mapData: mapData }) === false) return false;
        return true;
      }
      if (mapData.check_object[bot.x][bot.y] === true) return false;
      mapData.check_object[bot.x][bot.y] = true;
      var tmp_commands = { ...commands };
      tmp_commands.type = 'basic';
      add_tileoverlay({ mapData: mapData, x: bot.x, y: bot.y });
      if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
    } else {
      // if(Math.random() < prop_walk){
      //     build_permanent_wall({mapData: mapData, condition: commands.condition});
      //     return true;
      // }
      // var tmp_commands = {...commands};
      // tmp_commands.type = "basic";
      // if(generate_map({mapData: mapData, commands: tmp_commands}) === false)
      //     return false;
    }
  } else if (type === 'nested_if') {
    /// not done yet
  }
  mapData.platform[bot.x][bot.y] = 1;
  return true;
}

function count_blocks(commands) {
  let res = 0;
  // console.log(commands);
  commands = commands.commands;
  for (let i = 0; i < commands.length; i++) {
    if (commands[i] instanceof Object) {
      res += count_blocks(commands[i]);
    } else {
      res += 1;
    }
    // console.log(res);
  }
  return res;
}

function generate_tiles(mapData) {
  // const direction_to_word = ['xb', 'yf', 'xf', 'yb'];
  const direction_to_num = [1, 2, 4, 8];

  const nxt = { 0: [-1, 0], 1: [0, 1], 2: [1, 0], 3: [0, -1] };

  const FINAL = 1024;
  const FLOATING_OBJ = 16;

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      if (!mapData.platform[i][j]) {
        continue;
      }
      if (mapData.floatingobj[i][j] !== undefined) {
        mapData.tiles[i][j] += FLOATING_OBJ;
      }
      for (var k = 0; k < 4; k++) {
        if (mapData.wall[i][j] !== undefined && k in mapData.wall[i][j] && 'permanent' in mapData.wall[i][j][k]) {
          mapData.tiles[i][j] += direction_to_num[k];
        } else {
          let nx_ii = i + nxt[k][0];
          let nx_jj = j + nxt[k][1];
          if (nx_ii < 0 || nx_ii >= mapW || nx_jj < 0 || nx_jj >= mapH) {
            mapData.tiles[i][j] += direction_to_num[k];
          } else if (mapData.platform[i][j] === 1 && mapData.platform[nx_ii][nx_jj] === 0) {
            mapData.tiles[i][j] += direction_to_num[k];
          }
        }
      }
    }
  }

  mapData.tiles[mapData.end.x][mapData.end.y] += FINAL;

  return;
}

function transform_map(obj) {
  let { mapData } = obj;

  var bot = mapData.bot;
  var number_of_distractions = obj.number_of_distractions;

  if (number_of_distractions === undefined) number_of_distractions = 10;

  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  if (mapData.check_object[bot.x][bot.y] === true || mapData.count[bot.x][bot.y] > 1) return false;

  var direction_to_word = ['xb', 'yf', 'xf', 'yb'];
  mapData.end = { x: bot.x, y: bot.y };

  var mnX = 500,
    mnY = 500,
    mxX = -1,
    mxY = -1;
  for (var i = 0; i < mapW_real; i++) {
    for (var j = 0; j < mapH_real; j++) {
      if (mapData.platform[i][j] == 1) {
        mnX = Math.min(mnX, i);
        mxX = Math.max(mxX, i);
        mnY = Math.min(mnY, j);
        mxY = Math.max(mxY, j);
      }
    }
  }

  if (mxX - mnX + 1 > mapW || mxY - mnY + 1 > mapH) return false;

  let stX = mnX - Math.floor((mapW - (mxX - mnX + 1)) / 2);
  let stY = mnY - Math.floor((mapH - (mxY - mnY + 1)) / 2);

  // console.log(mapData.start.facing);
  mapData.player = {
    position: [mapData.start.x - stX, mapData.start.y - stY],
    beginPosition: [mapData.start.x - stX, mapData.start.y - stY],
    facing: direction_to_word[mapData.start.facing],
    beginFacing: direction_to_word[mapData.start.facing]
  };
  mapData.end = { x: mapData.end.x - stX, y: mapData.end.y - stY };
  mapData.platform = slice_2d_array(mapData.platform, stX, stX + mapW, stY, stY + mapH);
  mapData.wall = slice_2d_array(mapData.wall, stX, stX + mapW, stY, stY + mapH);
  mapData.enemies = slice_2d_array(mapData.enemies, stX, stX + mapW, stY, stY + mapH);
  mapData.tileoverlay = slice_2d_array(mapData.tileoverlay, stX, stX + mapW, stY, stY + mapH);
  mapData.floatingobj = slice_2d_array(mapData.floatingobj, stX, stX + mapW, stY, stY + mapH);
  mapData.count = slice_2d_array(mapData.count, stX, stX + mapW, stY, stY + mapH);
  mapData.check = slice_2d_array(mapData.check, stX, stX + mapW, stY, stY + mapH);
  mapData.check_object = slice_2d_array(mapData.check_object, stX, stX + mapW, stY, stY + mapH);
  mapData.walloverlay = slice_2d_array(mapData.walloverlay, stX, stX + mapW, stY, stY + mapH);
  mapData.tiles = slice_2d_array(mapData.tiles, stX, stX + mapW, stY, stY + mapH);

  generate_distraction({ mapData: mapData, number_of_distractions: number_of_distractions });

  // console.log('change walls');

  for (var i = -1; i <= mapW; i++) {
    for (var j = -1; j <= mapH; j++) {
      if (i < 0 || j < 0 || i >= mapW || j >= mapH) {
        for (var k = 0; k < 4; k++) {
          var new_i = i + directions[k][0];
          var new_j = j + directions[k][1];
          if (new_i < 0 || new_j < 0 || new_i >= mapW || new_j >= mapH) continue;
          if (mapData.wall[new_i][new_j] !== undefined && (k + 2) % 4 in mapData.wall[new_i][new_j]) {
            delete mapData.wall[new_i][new_j][(k + 2) % 4];
          }
        }
      } else if (mapData.platform[i][j] === 0) {
        mapData.wall[i][j] = undefined;
        for (let k = 0; k < 4; k++) {
          let new_i = i + directions[k][0];
          let new_j = j + directions[k][1];
          if (new_i < 0 || new_j < 0 || new_i >= mapW || new_j >= mapH) continue;
          if (mapData.wall[new_i][new_j] !== undefined && (k + 2) % 4 in mapData.wall[new_i][new_j]) {
            delete mapData.wall[new_i][new_j][(k + 2) % 4];
          }
        }
      }
    }
  }

  generate_tiles(mapData);

  for (let i = 0; i < mapW; i++) {
    for (let j = 0; j < mapH; j++) {
      for (let k = 0; k < 4; k++) {
        if (mapData.wall[i][j] !== undefined && k in mapData.wall[i][j]) {
          if ((k === 0 || k === 1) && 'permanent' in mapData.wall[i][j][k])
            mapData.wall[i][j][direction_to_word[k]] = mapData.wall[i][j][k];
          delete mapData.wall[i][j][k];
        }
      }
    }
  }

  delete mapData.check;
  delete mapData.check_object;
  delete mapData.bot;
  delete mapData.count;
  delete mapData.start;
}

function get_gems(mapData) {
  let res = 0;
  for (let i = 0; i < mapW; i++) {
    for (let j = 0; j < mapH; j++) {
      if (mapData.floatingobj[i][j] && mapData.floatingobj[i][j].objtype === 'gem') {
        res++;
      }
    }
  }
  return res;
}

export function get_map(obj) {
  // console.log(obj);
  let {
    commandLength,
    commandLengthInCondition,
    itemCollected,
    numIteration,
    numTurnInLoop,
    numberOfDistractions
  } = obj;

  if (commandLength === undefined) commandLength = 5;
  if (commandLengthInCondition === undefined) commandLengthInCondition = 0;
  if (itemCollected === undefined) itemCollected = 0;
  if (numIteration === undefined) numIteration = 0;
  if (numTurnInLoop === undefined) numTurnInLoop = 0;
  if (numberOfDistractions === undefined) numberOfDistractions = 0;

  itemCollected = parseInt(itemCollected);

  if (itemCollected === 0) {
    probs_of_actions = [0.5, 0.25, 0.25, 0, 0]; // 0: go ahead, 1: turn right, 2: turn left, 3: do action I, 4: do action II
    type_of_actions = 3;
  } else {
    probs_of_actions = [0.4, 0.2, 0.2, 0, 0.2]; // 0: go ahead, 1: turn right, 2: turn left, 3: do action I, 4: do action II
    type_of_actions = 5;
  }

  // console.log(probs_of_actions);

  var numberOfTries = 2000;
  while (numberOfTries--) {
    var chk = false;
    let commands;
    if (commandLengthInCondition > 0) {
      if (numIteration > 0) {
        commands = if_else_tile_condition_commands_with_loop({
          condition_type: 'if',
          number_of_commands: commandLengthInCondition,
          number_of_iterations: numIteration,
          is_reversed: false
        });
      } else {
        commands = if_else_tile_condition_commands_with_loop({
          condition_type: 'if',
          number_of_commands: commandLengthInCondition,
          number_of_iterations: 8,
          is_reversed: false
        });
      }
    } else if (numIteration > 0) {
      if (numTurnInLoop === '0') {
        commands = for_loop_commands({
          number_of_turns: 2,
          number_of_commands: commandLength,
          number_of_iterations: numIteration
        });
      } else {
        commands = for_loop_commands({
          number_of_turns: numTurnInLoop,
          number_of_commands: commandLength,
          number_of_iterations: numIteration
        });
      }
    } else {
      commands = basic_commands({ number_of_commands: commandLength, probs_of_actions, type_of_actions });
    }

    console.log(commands);

    // commands = for_loop_commands({number_of_turns: 3, number_of_commands: 6, number_of_iterations: 3});
    // commands = basic_commands({number_of_commands: 6});
    // commands = if_else_tile_condition_commands_with_loop({condition_type: "if", number_of_commands: 1, number_of_iterations: 20, is_reversed: false});
    let numberOfTriesGenerateMap = 10;
    while (numberOfTriesGenerateMap--) {
      var mapData = init_mapData();
      if (generate_map({ commands, mapData }) === false) continue;
      if (transform_map({ mapData, numberOfDistractions }) === false) continue;
      chk = true;
      break;
    }
    if (chk) {
      const gems = get_gems(mapData);
      mapData.blocks = { maxBlocks: count_blocks(commands), maxGems: gems, cntGems: 0 };
      console.log(mapData.blocks);
      break;
    }
  }
  // console.log(commands);
  if (chk) return mapData;
}
