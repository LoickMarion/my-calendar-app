import { describe, it, expect } from 'vitest';
import { parseCsv, csvToObjects, csvToTasks } from '../src/data/parseCsv.js';

describe('parseCsv', () => {
  it('splits simple comma-separated rows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('detects tab-delimited input when no commas are present', () => {
    expect(parseCsv('a\tb\tc\n1\t2\t3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields containing commas', () => {
    expect(parseCsv('name,note\n"Doe, Jane","hello, world"')).toEqual([
      ['name', 'note'],
      ['Doe, Jane', 'hello, world'],
    ]);
  });

  it('unescapes doubled quotes inside quoted fields', () => {
    expect(parseCsv('note\n"she said ""hi"""')).toEqual([
      ['note'],
      ['she said "hi"'],
    ]);
  });

  it('trims whitespace from each cell', () => {
    expect(parseCsv(' a , b \n 1 , 2 ')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('csvToObjects', () => {
  it('converts rows into objects keyed by lowercased header', () => {
    const objs = csvToObjects('Title,Category,Completed\nBuy milk,Errands,true');
    expect(objs).toEqual([
      { title: 'Buy milk', category: 'Errands', completed: true },
    ]);
  });

  it('defaults completed to false when missing or falsy', () => {
    const objs = csvToObjects('title\nWalk the dog');
    expect(objs[0].completed).toBe(false);
  });

  it('falls back to description for an empty title', () => {
    const objs = csvToObjects('description\nWater the plants');
    expect(objs[0].title).toBe('Water the plants');
  });

  it('skips fully blank rows', () => {
    const objs = csvToObjects('title\nFirst task\n\nSecond task');
    expect(objs.map(o => o.title)).toEqual(['First task', 'Second task']);
  });
});

describe('csvToTasks', () => {
  it('parses long-format rows (date, category, text) into tasks by date', () => {
    const csv = 'date,category,text\n2026-01-05,Work,Finish report';
    const tasks = csvToTasks(csv);
    expect(tasks['2026-01-05']).toEqual([
      { category: 'Work', description: 'Finish report', title: 'Finish report', completed: false },
    ]);
  });

  it('parses wide-format rows (date, one column per category)', () => {
    const csv = 'date,Work,Home\n2026-01-05,Finish report,Do laundry; Water plants';
    const tasks = csvToTasks(csv);
    expect(tasks['2026-01-05']).toEqual([
      { category: 'Work', description: 'Finish report', title: 'Finish report', completed: false },
      { category: 'Home', description: 'Do laundry', title: 'Do laundry', completed: false },
      { category: 'Home', description: 'Water plants', title: 'Water plants', completed: false },
    ]);
  });

  it('falls back to the legacy row-per-task format when no long/wide shape matches', () => {
    const csv = 'date,description\n2026-01-05,Pay bills';
    const tasks = csvToTasks(csv);
    expect(tasks['2026-01-05']).toEqual([
      { category: 'Imported', description: 'Pay bills', title: 'Pay bills', completed: false },
    ]);
  });

  it('skips rows with an unparseable date', () => {
    const csv = 'date,category,text\nnot-a-date,Work,Finish report';
    expect(csvToTasks(csv)).toEqual({});
  });

  it('returns an empty object for empty input', () => {
    expect(csvToTasks('')).toEqual({});
  });
});
