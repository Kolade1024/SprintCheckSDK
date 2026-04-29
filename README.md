# SprintCheck SDK React Migration

The project has been migrated to React. You can find the original logic in the `src/legacy` folder (reconstructed from memory/history).

## New Structure
- `src/components/sdk`: React components for each verification screen.
- `src/hooks/useSprintCheck`: State management for the verification flow.
- `src/lib`: Core logic for face matching and API communication.
- `src/LivenessSDK`: React-wrapped liveness detection.
