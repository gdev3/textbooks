import {first, wait} from '@mathigon/core';
import {$N, animate} from '@mathigon/boost';
import {Point} from '@mathigon/euclid';
import {isBetween, nearlyEquals} from '@mathigon/fermat';
import {confetti, Step} from '@mathigon/studio';
import {PolygonTile, Polypad} from '../shared/types';


export async function triangles($step: Step) {
  const $polypad = $step.$('x-polypad') as Polypad;
  $polypad.load({grid: 'tri-dots', tiles: [{name: 'polygon', options: '45 136.6,-155 136.6,-55 -36.6', x: 605, y: 123.21, colour: '#0f82f2'}]} as any);

  const $cutBtn = $step.$('figure .btn')!;
  $cutBtn.on('click', () => $polypad.tools.cutPolygon.enable());
  $polypad.on('change-selection', ({tiles}) => $cutBtn.toggle(!!tiles.length));

  const tile = first($polypad.tiles.values()) as PolygonTile;
  const target = tile.path.area / 4;

  await $polypad.check(tiles => tiles.every(t => nearlyEquals((t as PolygonTile).path.area, target, 1)));
  $step.addHint('correct');
  $step.score('cut');
  confetti();
}

export async function fibonacci($step: Step) {
  const $polypad = $step.$('x-polypad') as Polypad;
  $polypad.enableHotkeys();
  $polypad.load({tiles: [{name: 'polygon', options: 'square', x: 25, y: 25, colour: '#eb4726'}, {name: 'polygon', options: 'rectangle', x: 100, y: 25}], strokes: [{points: 'M0,100L0,150', colour: '#111111', brush: 'ruler'}, {points: 'M0,150L300,150', colour: '#111111', brush: 'ruler'}, {points: 'M300,150L300,100', colour: '#111111', brush: 'ruler'}, {points: 'M300,100L0,100', colour: '#111111', brush: 'ruler'}]} as any);

  await $polypad.check(tiles => {
    const goals = [0, 0, 0, 0, 0, 0];
    for (const t of tiles) {
      if (!isBetween(t.posn.x, -25, 325) || !isBetween(t.posn.y, 75, 175)) continue;
      if (!nearlyEquals(t.posn.y, 125, 1)) return;
      const x = Math.round((t.posn.x - 25) / 25);
      const indices = (t.options === 'square') ? [x / 2] : [(x - 1) / 2, (x + 1) / 2];
      for (const i of indices) goals[i] += 1;
    }
    return goals.every(t => t === 1);
  });

  $step.addHint('correct');
  $step.addHint('Now try to make another one!');

  $polypad.selection.clear();
  const $line = $N('line', {class: 'stroke marker', stroke: '#111'}, $polypad.$strokes);
  await animate((p) => {
    $line.setLine({x: 300 * p, y: 75}, {x: 300 * p, y: 175});
    const tile = $polypad.getTileAt(new Point(300 * p, 125), ['polygon']);
    if (tile && tile.colour !== '#23ab22') tile.setColour('#23ab22');
  }, 3000).promise;
  await wait(500);
  for (const t of $polypad.tiles.values()) t.setColour(t.options === 'square' ? '#eb4726' : '#0f82f2');
  $line.hide();
}
