import { hcmut } from '../hcmut';

describe('hcmut service', () => {
  describe('getCurrentSemester', () => {
    it('should return the correct semester for a given date', () => {
      // Test case 1: September (start of semester 1)
      let date = new Date('2024-09-01');
      let expected = { year: 2024, semester: 1, code: 241 };
      expect(hcmut.getCurrentSemester(date)).toEqual(expected);

      // Test case 2: January (middle of semester 2)
      date = new Date('2025-01-20');
      expected = { year: 2024, semester: 2, code: 242 };
      expect(hcmut.getCurrentSemester(date)).toEqual(expected);

      // Test case 3: June (middle of semester 3)
      date = new Date('2025-06-15');
      expected = { year: 2024, semester: 3, code: 243 };
      expect(hcmut.getCurrentSemester(date)).toEqual(expected);
    });
  });

  describe('getAdjacentSemesters', () => {
    it('should return the correct adjacent semesters for a given semester code', () => {
      // Test case 1: Semester 1
      let semCode = 241;
      let expected = [233, 241, 242];
      expect(hcmut.getAdjacentSemesters(semCode)).toEqual(expected);

      // Test case 2: Semester 2
      semCode = 242;
      expected = [241, 242, 243];
      expect(hcmut.getAdjacentSemesters(semCode)).toEqual(expected);

      // Test case 3: Semester 3
      semCode = 243;
      expected = [242, 243, 251];
      expect(hcmut.getAdjacentSemesters(semCode)).toEqual(expected);
    });
  });
});
