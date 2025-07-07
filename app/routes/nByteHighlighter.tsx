import Index from "@/features";

export function meta() {
  return [
    { title: "nバイト ハイライター" },
    {
      name: "description",
      content: "1～4バイト文字などを判定するツールです。",
    },
  ];
}

export default function IndexPage() {
  return <Index />;
}
