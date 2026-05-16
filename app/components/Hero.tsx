export default function Hero() {

  return (
    <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-10 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500">
        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          ใหม่
        </span>
        <span>ฟรี · ไม่ต้องสมัคร · ใช้ได้ทั้งมือถือและคอม</span>
      </div>

      {/* Heading */}
      <h1 className="text-6xl sm:text-7xl font-black leading-tight text-gray-950 mb-6">
        <span className="block">จดโพย Guild War</span>
        <span className="block mt-1">
          ง่าย ๆ ใน{" "}
          <span className="relative inline-block">
            <span
              className="relative z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              10 วินาที
            </span>
            <span
              className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-sm -m-1"
              aria-hidden
            />
          </span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 text-lg max-w-xl mb-10">
        ไม่ต้องเตรียม assets ไม่ต้องใช้ Google Sheet —{" "}
        แค่จิ้มก็ได้โพยของกิลด์ตัวเองแล้ว
      </p>

    </section>
  );
}
