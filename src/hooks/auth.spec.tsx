import { renderHook, act } from '@testing-library/react-hooks';
import fetchMock from 'jest-fetch-mock';
import { mocked } from 'ts-jest/utils';

import { AuthProvider, useAuth } from './auth';
import { startAsync } from 'expo-auth-session';

fetchMock.enableMocks();

jest.mock('expo-auth-session');
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}))

describe('Auth Hook', () => {
  it('should be able to sign in with Google account existing', async () => {
    const userTest = {
      id: 'any_id',
      email: 'any@email.com',
      name: 'Not Name',
      photo: 'any_photo.png'
    }

    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token',
      }
    });

    fetchMock.mockResponseOnce(JSON.stringify(userTest));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user.email)
      .toBe(userTest.email);
  });

  it('user should not connect if cancel authentication with Google account', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'cancel'
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).not.toHaveProperty('id');
  });
});