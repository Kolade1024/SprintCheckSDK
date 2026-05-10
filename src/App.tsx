import { SprintCheckSDK } from './components/sdk/SprintCheckSDK'

interface AppProps {
  apiKey?: string;
  encryptionKey?: string;
  email?: string;
  callbackUrl?: string;
}

function App({ apiKey, encryptionKey, email, callbackUrl }: AppProps) {
  return (
    <SprintCheckSDK
      apiKey={apiKey}
      encryptionKey={encryptionKey}
      email={email}
      callbackUrl={callbackUrl}
    />
  )
}

export default App
