import React from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, Coffee, Utensils, Gift } from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  side: "left" | "right";
  image?: string;
}

const events: TimelineEvent[] = [
  {
    date: "25/12/2024",
    title: "Ngày đầu gặp gỡ",
    description:
      "Lần đầu tiên chúng mình biết nhau là ở trên FB Dating, mặc dù có khoảng thời gian dài bị bơ nhưng anh cũng rất vui vì quen biết em.",
    icon: <Coffee className="w-6 h-6 text-rose-500" />,
    side: "left",
  },
  {
    date: "16/02/2025",
    title: "Buổi hẹn đầu tiên",
    description:
      "Chúng mình đã đi xem phim và ăn trưa ở quán mì cay. Em rất xinh và câu nói làm em nhớ quài: Em chải đầu chưa ? 😂",
    icon: <Utensils className="w-6 h-6 text-rose-500" />,
    side: "right",
  },
  {
    date: "17/05/2025",
    title: "Chính thức yêu nhau",
    description: "Ngày anh ngỏ lời và em đã gật đầu. Một chương mới bắt đầu!",
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    side: "left",
  },
  {
    date: "14/02/2026",
    title: "Valentine đầu tiên",
    description:
      "Kỷ niệm Valentine đầu tiên bên nhau. Hy vọng sẽ còn nhiều mùa Valentine nữa.",
    icon: <Gift className="w-6 h-6 text-rose-500" />,
    side: "right",
  },
  {
    date: "Hôm nay",
    title: "Hành trình tiếp diễn",
    description:
      "Câu chuyện của chúng mình vẫn đang được viết tiếp mỗi ngày...",
    icon: <Calendar className="w-6 h-6 text-rose-500" />,
    side: "left",
  },
];

interface TimelineProps {
  onBack: () => void;
}

export function Timeline({ onBack }: TimelineProps) {
  return (
    <div className="min-h-screen bg-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-center text-rose-800 flex-1 mr-20">
            Câu Chuyện Tình Yêu
          </h1>
        </div>

        <div className="relative wrap overflow-hidden p-4 h-full">
          {/* Vertical Line - Adjusted for mobile */}
          <div className="border-2-2 absolute border-opacity-20 border-rose-700 h-full border left-[30px] md:left-1/2 transform md:-translate-x-1/2"></div>

          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`mb-8 flex justify-between items-center w-full ${
                event.side === "left"
                  ? "md:flex-row-reverse"
                  : "flex-row md:flex-row"
              }`}
            >
              {/* Empty space for desktop side-by-side */}
              <div className="hidden md:block w-5/12"></div>

              {/* Icon Circle */}
              <div className="z-20 flex items-center order-1 bg-rose-100 shadow-xl w-10 h-10 rounded-full border-4 border-white justify-center flex-shrink-0">
                {event.icon}
              </div>

              {/* Content Box */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`order-1 w-[calc(100%-50px)] md:w-5/12 ml-4 md:ml-0 px-5 sm:px-6 py-4 rounded-lg shadow-xl bg-white border-t-4 border-rose-500 ${
                  event.side === "left" ? "md:text-right" : "md:text-left"
                }`}
              >
                <h3 className="mb-1 font-bold text-gray-800 text-lg sm:text-xl">
                  {event.title}
                </h3>
                <span className="mb-2 block text-sm font-semibold text-rose-500">
                  {event.date}
                </span>
                <p className="text-sm leading-relaxed text-gray-600 text-opacity-100">
                  {event.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-rose-600 italic">
            "Tình yêu không tính bằng số ngày, tháng hay năm chúng mình bên
            nhau. Tình yêu là việc chúng mình yêu nhau nhiều như thế nào mỗi
            ngày."
          </p>
        </div>
      </div>
    </div>
  );
}
