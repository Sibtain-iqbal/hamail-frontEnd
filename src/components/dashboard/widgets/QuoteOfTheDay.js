"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import vector1 from "../../../../public/Vector 1.png";
import vector2 from "../../../../public/Vector 2.png";

export default function QuoteOfTheDay({
  quotes = "You followed your plan for 3 days. Discipline compounds.",
  authors = "Paityn Bator",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative flex flex-col items-center p-6 bg-gradient-to-r from-[#EAEFF1]  to-[#E6F6F6] overflow-hidden border border-[#fff]"
      style={{
        width: "100%",
        height: "264px",
        borderRadius: "20px",
        // backgroundColor: "bg-gradient-to-r from-[#000000]  to-[#EAEFF1]",
        borderColor: "#fff",
      }}
    >
      {/* Top Decoration Line (Envelope Style) */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none">
        {/* <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 L50 60 L100 0"
            fill="none"
            stroke="white"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg> */}
        <Image
          src={vector1}
          className=" absolute right-0 "
          alt="vector1"
          width={260}
          // height={250}
          priority
        />
        <Image
          src={vector2}
          className=" absolute left-0 "
          alt="vector2"
          width={260}
          // height={250}
          priority
        />
      </div>

      {/* Quote Icon */}
      <div className="relative z-10 mt-4 mb-4">
        <Image
          className="opacity-90"
          src={"/quotes.png"}
          alt={quotes}
          width={48}
          height={48}
        />
      </div>

      {/* Quote Text */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 md:px-12">
        <p className="text-6 text-[#363636] font-normal max-w-[380px]">
          {quotes}
        </p>
      </div>

      {/* Author */}
      <div className="relative z-10 flex items-center gap-3 mt-auto mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 relative shadow-sm">
          {/* Placeholder for author image */}
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
            {/* If we had an image, we'd use Next.js Image here */}
            <Image src={"/Elipse.png"} alt={authors} width={48} height={48} />
          </div>
        </div>
        <span className="text-[#363636] text-sm font-medium">{authors}</span>
      </div>
    </motion.div>
  );
}
