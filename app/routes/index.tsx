import type { Route } from "./+types/index";
import React, { useState, useEffect, useCallback } from "react";
import GraphemeSplitter from "grapheme-splitter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "nバイト ハイライター" },
    {
      name: "description",
      content: "1～4バイト文字などを判定するツールです。",
    },
  ];
}

// =====================
// 型定義
// =====================
// チェックボックスの状態型
type CheckedState = Record<string, boolean>;
// Settingsコンポーネントのprops型
type SettingsProps = {
  checked: CheckedState;
  onChange: (id: string, value: boolean) => void;
};
// Inputコンポーネントのprops型
type InputProps = {
  value: string;
  onChange: (v: string) => void;
};
// Outputコンポーネントのprops型
type OutputProps = {
  highlighted: React.ReactNode;
};

// =====================
// 定数（初期値・デフォ文言）
// =====================
const defaultInput = [
  "これは1～4バイト文字などを判定するツールです。",
  "",
  "【例文】",
  "𠮷川さんへ",
  "先ほど『α波とβ波のグラフ』を𡚴本さんから貰いました‼",
  "下記のサイトにアップしてますので確認ください❗",
  "« https://example.com/ »",
  "以上、よろしくお願いいたします🙏🏻🙇🏼‍♀️",
  "",
  "PS. 結合文字の「が ( か+゙ )」は文字化けするので「が」を使って下さい",
].join("\n");
const DEFAULT_RESULT = (
  <span className="text-gray-400">ここに結果が出ます</span>
);

// =====================
// メインコンポーネント
// =====================
export default function Index() {
  // 入力値の状態管理
  const [input, setInput] = useState(defaultInput);
  // ハイライト結果の状態管理（初期値はデフォ文言）
  const [highlighted, setHighlighted] =
    useState<React.ReactNode>(DEFAULT_RESULT);
  // チェックボックスの状態管理
  const [checked, setChecked] = useState<CheckedState>({
    "highlight-1byte-characters": false,
    "highlight-2byte-characters": false,
    "highlight-3byte-characters": false,
    "highlight-4byte-characters": true,
  });

  // バイト数ごとの色マップ
  const colorMap: Record<number, string> = {
    1: "bg-blue-200 text-blue-900",
    2: "bg-green-200 text-green-900",
    3: "bg-yellow-200 text-yellow-900",
    4: "bg-red-200 text-red-900",
  };
  // チェックボックスID→バイト数変換
  const idToByte: Record<string, number> = {
    "highlight-1byte-characters": 1,
    "highlight-2byte-characters": 2,
    "highlight-3byte-characters": 3,
    "highlight-4byte-characters": 4,
  };

  // =====================
  // ハイライト判定ロジック
  // =====================
  // 入力やチェックボックスの状態が変わるたびに自動で判定
  const handleExec = useCallback(() => {
    const enabledBytes = Object.entries(checked)
      .filter(([_, v]) => v)
      .map(([k]) => idToByte[k]);
    const splitter = new GraphemeSplitter();
    const graphemes = splitter.splitGraphemes(input);
    // 入力が空ならデフォ文言を表示
    if (!input) {
      setHighlighted(DEFAULT_RESULT);
      return;
    }
    // 各グラフェームごとにバイト数を判定し、最大バイト数で色分け
    const nodes = graphemes.map((grapheme, i) => {
      const encoder = new TextEncoder();
      const codePoints = [...grapheme];
      const byteLengths = codePoints.map((cp) => encoder.encode(cp).length);
      const maxByte = Math.max(...byteLengths);
      const displayByte = maxByte >= 4 ? 4 : maxByte;
      if (enabledBytes.includes(displayByte)) {
        return (
          <span
            key={i}
            className={`px-0.5 rounded ${colorMap[displayByte]} font-bold`}
            title={`${byteLengths.join("+")}バイト`}
            data-byte={byteLengths.join(",")}
          >
            {grapheme}
          </span>
        );
      } else {
        return (
          <span key={i} data-byte={byteLengths.join(",")}>
            {grapheme}
          </span>
        );
      }
    });
    setHighlighted(nodes);
  }, [input, checked]);

  // useEffectで自動判定（依存配列でinput, checkedの変化を監視）
  useEffect(() => {
    handleExec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, checked]);

  // チェックボックス変更時のハンドラ
  const handleCheckbox = (id: string, value: boolean) => {
    setChecked((prev) => ({ ...prev, [id]: value }));
  };

  // =====================
  // レンダリング
  // =====================
  return (
    <>
      <Header checked={checked} onChange={handleCheckbox} />
      <MainArea input={input} setInput={setInput} highlighted={highlighted} />
    </>
  );
}

// =====================
// Header（設定のみ）
// =====================
function Header({ checked, onChange }: SettingsProps) {
  // 設定（チェックボックス）をヘッダーに表示
  return (
    <header className="fixed z-1 w-full h-20 bg-background/50 backdrop-blur-sm border-b">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center h-full">
        <Settings checked={checked} onChange={onChange} />
      </div>
    </header>
  );
}

// =====================
// メインエリア（説明＋入力＋出力）
// =====================
function MainArea({
  input,
  setInput,
  highlighted,
}: {
  input: string;
  setInput: (v: string) => void;
  highlighted: React.ReactNode;
}) {
  // 説明文・入力・出力をまとめて表示
  return (
    <main className="max-w-screen-xl mx-auto p-6 space-y-6 pt-28">
      <article>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          <li>これは1～4バイト文字などを判定するツールです</li>
          <li>
            判定はブラウザ上で行われるため、サーバーに保存されることはありません
          </li>
          <li>UTF-8で判定するため、平仮名は3バイト文字になります</li>
          <li>色が付いてる箇所へマウスオーバーするとバイト数が表示されます</li>
          <li>デフォルトでは4バイト文字のみ、ハイライトされます</li>
          <li>テキストを入力すると自動で判定されます</li>
          <li>
            結合文字列と合字は複数の文字で構成されているため、最大のバイト数で判定をしています
            <ul className="list-disc list-inside ml-4">
              <li>
                結合文字列である「が」は、「か+&#x3099;」の2文字で構成されています。
                「 か 」と「 &#x3099;」は両方とも3バイトのため、
                「が」は3バイト文字として判定されます
              </li>
              <li>
                合字である「🙇🏼‍♀️」は「&#x1f647;+&#x1f3fb;+&#x200d;+&#x2640;+&#xfe0f;」の5文字で構成されています。
                「 &#x1f647; 」と「 &#x1f3fb; 」が4バイトのため、
                「🙇🏼‍♀️」は4バイト文字として判定されます
              </li>
            </ul>
          </li>
        </ul>
      </article>
      <article className="grid grid-cols-2 gap-6">
        <Input value={input} onChange={setInput} />
        <Output highlighted={highlighted} />
      </article>
    </main>
  );
}

// =====================
// 設定（チェックボックス）
// =====================
function Settings({ checked, onChange }: SettingsProps) {
  // ハイライト対象バイト数のチェックボックスリスト
  const checkboxList = [
    {
      id: "highlight-1byte-characters",
      label: "1バイト文字",
      color: {
        label:
          "has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950",
        checkbox:
          "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700",
      },
    },
    {
      id: "highlight-2byte-characters",
      label: "2バイト文字",
      color: {
        label:
          "has-[[aria-checked=true]]:border-green-600 has-[[aria-checked=true]]:bg-green-50 dark:has-[[aria-checked=true]]:border-green-900 dark:has-[[aria-checked=true]]:bg-green-950",
        checkbox:
          "data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700",
      },
    },
    {
      id: "highlight-3byte-characters",
      label: "3バイト文字",
      color: {
        label:
          "has-[[aria-checked=true]]:border-yellow-600 has-[[aria-checked=true]]:bg-yellow-50 dark:has-[[aria-checked=true]]:border-yellow-900 dark:has-[[aria-checked=true]]:bg-yellow-950",
        checkbox:
          "data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white dark:data-[state=checked]:border-yellow-700 dark:data-[state=checked]:bg-yellow-700",
      },
    },
    {
      id: "highlight-4byte-characters",
      label: "4バイト以上の文字",
      color: {
        label:
          "has-[[aria-checked=true]]:border-red-600 has-[[aria-checked=true]]:bg-red-50 dark:has-[[aria-checked=true]]:border-red-900 dark:has-[[aria-checked=true]]:bg-red-950",
        checkbox:
          "data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:data-[state=checked]:border-red-700 dark:data-[state=checked]:bg-red-700",
      },
    },
  ];
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {checkboxList.map((checkbox) => (
        <Label
          key={checkbox.id}
          className={`bg-background hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${checkbox.color.label}`}
        >
          <Checkbox
            id={checkbox.id}
            checked={checked[checkbox.id]}
            onCheckedChange={(v) => onChange(checkbox.id, !!v)}
            className={`${checkbox.color.checkbox}`}
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">{checkbox.label}</p>
          </div>
        </Label>
      ))}
    </div>
  );
}

// =====================
// テキスト入力
// =====================
function Input({ value, onChange }: InputProps) {
  // テキスト入力欄
  return (
    <Card>
      <CardHeader>
        <CardTitle>テキスト入力</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          id="input"
          className="h-full resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}

// =====================
// ハイライト結果
// =====================
function Output({ highlighted }: OutputProps) {
  // ハイライト結果表示欄
  return (
    <Card>
      <CardHeader>
        <CardTitle>ハイライト結果</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea
          className="max-h-full bg-secondary rounded-lg py-2 px-4 border h-full"
          type="always"
        >
          <div className="break-all whitespace-pre-wrap text-sm min-h-[2rem]">
            {highlighted}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
