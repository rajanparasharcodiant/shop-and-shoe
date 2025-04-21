import bannervideo from '~/assets/video_banner.mp4';

export default function VideoBanner() {
  return (
    <div className="video-shopify-section w-full relative overflow-hidden">
      <video
        className="w-full h-auto object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={bannervideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="video-banner absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
        <h1 className="text-5xl md:text-6xl font-bold text-center">
          Welcome to Shop and Shoe Store..
        </h1><br/>
        <a href='\collections/all' className="button px-4 border border-[#345546] py-2 cursor-pointer rounded-full text-sm font-semibold transition bg-[#345546] text-white">
          Shop Now
        </a>
      </div>
    </div>
  );
}
