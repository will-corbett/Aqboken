import { describe, expect, it } from 'vitest';
import { caseForm, copula, harmonyOf, numberWords, past, pastNeg, plural, possessive, present, presentNeg, questionParticle } from '../../src/shared/kazakh.ts';
import { toLatin } from '../../src/shared/script.ts';

describe('vowel harmony', () => {
  it.each([
    ['бала', 'back'],
    ['кітап', 'back'],
    ['үй', 'front'],
    ['мектеп', 'front'],
    ['су', 'back'],
    ['би', 'front'],
    ['күйеу', 'front'],
    ['алфавит', 'front'],
    ['минут', 'back'],
    ['актёр', 'front'],
  ] as const)('%s is %s', (w, h) => expect(harmonyOf(w)).toBe(h));
});

describe('nouns', () => {
  it('plurals', () => {
    expect(['бала', 'үй', 'қол', 'адам', 'қыз', 'кітап', 'мектеп', 'дос'].map((w) => plural(w))).toEqual(['балалар', 'үйлер', 'қолдар', 'адамдар', 'қыздар', 'кітаптар', 'мектептер', 'достар']);
  });
  it('cases', () => {
    expect(caseForm('адам', 'gen')).toBe('адамның');
    expect(caseForm('қыз', 'gen')).toBe('қыздың');
    expect(caseForm('кітап', 'gen')).toBe('кітаптың');
    expect(caseForm('бала', 'acc')).toBe('баланы');
    expect(caseForm('үй', 'dat')).toBe('үйге');
    expect(caseForm('мектеп', 'dat')).toBe('мектепке');
    expect(caseForm('қала', 'loc')).toBe('қалада');
    expect(caseForm('мектеп', 'loc')).toBe('мектепте');
    expect(caseForm('адам', 'abl')).toBe('адамнан');
    expect(caseForm('үй', 'abl')).toBe('үйден');
    expect(caseForm('автобус', 'ins')).toBe('автобуспен');
    expect(caseForm('қыз', 'ins')).toBe('қызбен');
    expect(caseForm('қалам', 'ins')).toBe('қаламмен');
    expect(caseForm('отбасы', 'dat', { possessed: true })).toBe('отбасына');
  });
  it('possessives', () => {
    expect(possessive('бала', '1sg')).toBe('балам');
    expect(possessive('кітап', '1sg')).toBe('кітабым');
    expect(possessive('жүрек', '3')).toBe('жүрегі');
    expect(possessive('құлақ', '2sg')).toBe('құлағың');
    expect(possessive('әке', '3')).toBe('әкесі');
    expect(possessive('үй', '1pl')).toBe('үйіміз');
    expect(possessive('дос', '2sgf')).toBe('досыңыз');
    expect(possessive('ауыз', '1sg', { possStem: 'ауз' })).toBe('аузым');
    expect(possessive('банк', '3', { noVoicing: true, harmony: 'front' })).toBe('банкі');
  });
  it('personal endings', () => {
    expect(copula('мұғалім', '1sg')).toBe('мұғаліммін');
    expect(copula('студент', '1sg')).toBe('студентпін');
    expect(copula('қазақ', '1pl')).toBe('қазақпыз');
    expect(copula('қыз', '1sg')).toBe('қызбын');
    expect(copula('дәрігер', '2sg')).toBe('дәрігерсің');
    expect(copula('дәрігер', '3')).toBe('дәрігер');
  });
  it('question particle', () => {
    expect(questionParticle('кітап')).toBe('па');
    expect(questionParticle('қала')).toBe('ма');
    expect(questionParticle('барасың')).toBe('ба');
    expect(questionParticle('мектеп')).toBe('пе');
  });
});

describe('verbs', () => {
  it('present', () => {
    expect(present('бар', '1sg')).toBe('барамын');
    expect(present('кел', '3')).toBe('келеді');
    expect(present('оқы', '1sg')).toBe('оқимын');
    expect(present('оқы', '3')).toBe('оқиды');
    expect(present('тыңда', '1sg')).toBe('тыңдаймын');
    expect(present('сөйле', '2sgf')).toBe('сөйлейсіз');
    expect(present('тап', '1sg')).toBe('табамын');
    expect(present('шық', '3')).toBe('шығады');
    expect(present('жу', '1sg')).toBe('жуамын');
    expect(present('ки', '3')).toBe('киеді');
    expect(present('сүй', '1sg')).toBe('сүйемін');
    expect(present('жұмыс істе', '1sg')).toBe('жұмыс істеймін');
  });
  it('negative present', () => {
    expect(presentNeg('бар', '1sg')).toBe('бармаймын');
    expect(presentNeg('кел', '3')).toBe('келмейді');
    expect(presentNeg('айт', '1sg')).toBe('айтпаймын');
    expect(presentNeg('жаз', '1sg')).toBe('жазбаймын');
    expect(presentNeg('оқы', '2sg')).toBe('оқымайсың');
  });
  it('past', () => {
    expect(past('бар', '1sg')).toBe('бардым');
    expect(past('айт', '3')).toBe('айтты');
    expect(past('кел', '1pl')).toBe('келдік');
    expect(past('бар', '1pl')).toBe('бардық');
    expect(past('оқы', '2sgf')).toBe('оқыдыңыз');
    expect(pastNeg('бар', '1sg')).toBe('бармадым');
    expect(pastNeg('айт', '3')).toBe('айтпады');
    expect(pastNeg('кел', '1pl')).toBe('келмедік');
  });
});

describe('numbers', () => {
  it.each([
    [0, 'нөл'],
    [7, 'жеті'],
    [11, 'он бір'],
    [25, 'жиырма бес'],
    [100, 'жүз'],
    [342, 'үш жүз қырық екі'],
    [1000, 'бір мың'],
    [1991, 'бір мың тоғыз жүз тоқсан бір'],
    [2026, 'екі мың жиырма алты'],
  ] as const)('%i', (n, w) => expect(numberWords(n)).toBe(w));
});

describe('Latin script (2021)', () => {
  it('converts', () => {
    expect(toLatin('Қазақстан')).toBe('Qazaqstan');
    expect(toLatin('үй')).toBe('üi');
    expect(toLatin('ыстық')).toBe('ystyq');
    expect(toLatin('кітап')).toBe('kıtap');
    expect(toLatin('Шығыс')).toBe('Şyğys');
    expect(toLatin('жаңа')).toBe('jaña');
    expect(toLatin('ұл')).toBe('ūl');
  });
});
