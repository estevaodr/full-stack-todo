/**
 * Manual mock for jwt-decode
 * 
 * This mock is used by Jest to replace the jwt-decode module during testing.
 * It provides a mock implementation of jwtDecode that can be controlled in tests.
 */

export const jwtDecode = jest.fn();
