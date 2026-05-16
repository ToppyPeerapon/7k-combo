import type { Metadata } from "next";
import BuilderClient from "./BuilderClient";

export const metadata: Metadata = {
  title: "Team Builder | 7K Builder",
  description: "สร้างทีม วางแผนสกิลซีเควนซ์ และเลือกไอเทมสำหรับ Seven Knights Rebirth",
};

export default function BuilderPage() {
  return <BuilderClient />;
}
