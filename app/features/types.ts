// チェックボックスの状態型
export type CheckedState = Record<string, boolean>;
// Settingsコンポーネントのprops型
export type SettingsProps = {
  checked: CheckedState;
  onChange: (id: string, value: boolean) => void;
};
// Inputコンポーネントのprops型
export type InputProps = {
  value: string;
  onChange: (v: string) => void;
};
// Outputコンポーネントのprops型
export type OutputProps = {
  highlighted: React.ReactNode;
};