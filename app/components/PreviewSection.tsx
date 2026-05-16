import TeamCard from "./TeamCard";

const mockTeams = [
  {
    label: "ทีมที่ต้องการดี",
    count: 2,
    mainChars: ["ชุนหงอคง", "เอมิเลีย"],
    subChars: ["แร็ดกรัด"],
    badge: "B",
    subBadge: "F",
  },
  {
    label: "ทีมที่ต้องการดี",
    count: 4,
    mainChars: ["เฟรซา", "เฟรซ่า"],
    subChars: ["มิเลีย", "วาเนสซา"],
    badge: "B",
    subBadge: "F",
  },
  {
    label: "ทีมที่ต้องการดี",
    count: 1,
    mainChars: ["โคลท์", "เอมิเลีย"],
    subChars: ["เพลตัน"],
    badge: "B",
    subBadge: "F",
  },
  {
    label: "ทีมที่ต้องการดี",
    count: 2,
    mainChars: ["ชุนหงอคง"],
    subChars: ["เอลิเซีย", "เกลลิดัส"],
    badge: "B",
    subBadge: "F",
  },
  {
    label: "ทีมที่ต้องการดี",
    count: 4,
    mainChars: ["พาลามอส"],
    subChars: ["โรซี่", "น็อกซ์"],
    badge: "B",
    subBadge: "F",
  },
  {
    label: "ทีมที่ต้องการดี",
    count: 2,
    mainChars: ["ไคส์", "สิโป"],
    subChars: ["บรันซ์ & บรันเซล"],
    badge: "B",
    subBadge: "F",
  },
];

export default function PreviewSection() {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-5xl mx-auto border-2 border-blue-100 rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTeams.map((team, i) => (
            <TeamCard key={i} {...team} />
          ))}
        </div>
      </div>
    </section>
  );
}
