import React, { 
  createContext, 
  ReactNode, 
  useContext,
  useState
} from "react";

import * as AuthSession from 'expo-auth-session';

const AuthContext = createContext({} as IAuthContextData);

interface AuthProviderProps {
  children: ReactNode
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  },
  type: string;
}

function AuthProvider({ children }: AuthProviderProps){
  const [user, setUser] = useState<User>({} as User);

  async function signInWithGoogle() {
    try{
      const CLIENT_ID = '19640765769-rbfqhnucev2gmndbv794isc0r30h5qj6.apps.googleusercontent.com';
      const REDIRECT_URI = 'https://auth.expo.io/@rsimplicio/gofinances';
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params } = await AuthSession
      .startAsync({ authUrl }) as AuthorizationResponse;

      if(type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        
        setUser({
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          photo: userInfo.picture
        });
      }

    } catch (error) {
      throw new Error(error as string);
    }
  }

  return(
    <AuthContext.Provider value={{
      user,
      signInWithGoogle
    }}>
      { children }
    </AuthContext.Provider>
  );
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth }