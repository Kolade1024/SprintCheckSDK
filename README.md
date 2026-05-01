# SprintCheck React SDK

The direct, drop-in React SDK for the SprintCheck identity validation and liveness detection platform.

---

## Features
- **Seamless Integration**: Easily add verification modals to your React app.
- **Embedded Style & Layout**: Zero external CSS stylesheets to import! Custom styling is injected dynamically by the package.
- **Biometric Liveness Detection**: Fully interactive identity verification steps.
- **Type-safe**: Built with TypeScript definitions included.

---

## Installation

```bash
npm install sprintcheck-react-sdk
```

---

## Basic Usage

To launch the verification flow, add the component to your page and pass your API credentials as props.

```tsx
import { useState } from 'react';
import { SprintCheckSDK } from 'sprintcheck-react-sdk';

export default function VerificationPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Complete Your Profile Verification</h2>
      <button onClick={() => setIsOpen(true)}>Start Verification</button>

      {isOpen && (
        <SprintCheckSDK
          apiKey="YOUR_SPRINTCHECK_API_KEY"
          encryptionKey="YOUR_SPRINTCHECK_ENCRYPTION_KEY"
          email="user@example.com"
        />
      )}
    </div>
  );
}
```

---

## Custom Hooks (Advanced Users)

If you prefer to build a custom interface around our verification state, you can import our state hook directly:

```tsx
import { useSprintCheck } from 'sprintcheck-react-sdk';

export function CustomVerifyFlow() {
  const { startVerification, state } = useSprintCheck({
    apiKey: 'YOUR_SPRINTCHECK_API_KEY',
    encryptionKey: 'YOUR_SPRINTCHECK_ENCRYPTION_KEY'
  });

  return (
    <button onClick={() => startVerification('FACE')}>
      Verify Biometrics
    </button>
  );
}
```

---

## Props Reference

The `<SprintCheckSDK />` component accepts the following properties:

| Prop | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | Yes | Your platform API Key. |
| `encryptionKey` | `string` | Yes | Your platform Encryption Key. |
| `email` | `string` | No | Prefill user email address for onboarding. |

---

## Building Locally

To test or bundle the SDK locally:
```bash
# Start development proxy server
npm run dev

# Build production distribution bundle files
npm run build
```
