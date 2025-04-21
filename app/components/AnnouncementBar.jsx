import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';

import {Autoplay} from 'swiper/modules';

const messages = [
  '🚚 Free shipping on orders over $50!',
  '🎉 20% off all items until Sunday!',
  '💬 Chat with us for personalized help!',
];

export default function AnnouncementBar() {
  return (
    <div className="announcementbar text-white text-base p-4 uppercase">
      <Swiper
        modules={[Autoplay]}
        autoplay={{delay: 3000, disableOnInteraction: false}}
        loop={true}
        slidesPerView={1}
        className="w-full"
      >
        {messages.map((msg, index) => (
          <SwiperSlide key={index}>
            <div className="text-center tracking-widest">{msg}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}