
import { Link } from "wouter";

export default function Footer() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black">
      <div className="h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50 animate-pulse"></div>
      <footer className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="block sm:hidden">
          <div className="flex flex-col items-center space-y-6 mb-8">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <img alt="Axiom Logo" loading="lazy" width="70" height="70" decoding="async" data-nimg="1" className="rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300" style={{ color: 'transparent' }} src="/assets/axiom-logo.png" />
              </Link>
              <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Axiom
              </span>
            </div>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              We are a small hosting provider focused on providing the best service we can to our thousands of users.</p>
          </div>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div className="space-y-5 text-center">
              <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1 mx-auto">
                Services
              </h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="/services/minecraft-server-hosting">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="server" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 32zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM64 288c-35.3 0-64 28.7-64 64l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 288zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm56 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"></path>
                    </svg>Minecraft
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="/services/discord-bot-hosting">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="robot" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                      <path fill="currentColor" d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z">
                      </path>
                    </svg>
                    Discord Bots
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="/services">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path fill="currentColor" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z">
                      </path>
                    </svg>
                    More Services
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1 mx-auto">
                About
              </h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="/about">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="building" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                      <path fill="currentColor" d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c26.5 0 48-21.5 48-48l0-416c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16z">
                      </path>
                    </svg>
                    About Us
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="/sitemap">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sitemap" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                      <path fill="currentColor" d="M208 80c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-8 0 0 40 152 0c30.9 0 56 25.1 56 56l0 32 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-32c0-4.4-3.6-8-8-8l-152 0 0 40 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-40-152 0c-4.4 0-8 3.6-8 8l0 32 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-32c0-30.9 25.1-56 56-56l152 0 0-40-8 0c-26.5 0-48-21.5-48-48l0-64z">
                      </path>
                    </svg>
                    Sitemap
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://status.sillydev.co.uk">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gauge-high" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM256 416c35.3 0 64-28.7 64-64c0-17.4-6.9-33.1-18.1-44.6L366 161.7c5.3-12.1-.2-26.3-12.3-31.6s-26.3 .2-31.6 12.3L257.9 288c-.6 0-1.3 0-1.9 0c-35.3 0-64 28.7-64 64s28.7 64 64 64zM176 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM96 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm352-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z">
                      </path>
                    </svg>
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1 mx-auto">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://client.sillydev.co.uk/privacy">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path fill="currentColor" d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z">
                      </path>
                    </svg>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://client.sillydev.co.uk/tos">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gavel" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M318.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-120 120c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l4-4L325.4 293.4l-4 4c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l120-120c12.5-12.5 12.5-32.8 0-45.3l-16-16c-12.5-12.5-32.8-12.5-45.3 0l-4 4L330.6 74.6l4-4c12.5-12.5 12.5-32.8 0-45.3l-16-16zm-152 288c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l48 48c12.5 12.5 32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-1.4-1.4L272 285.3 226.7 240 168 298.7l-1.4-1.4z">
                      </path>
                    </svg>
                    Terms Of Service
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://client.sillydev.co.uk/fairuse">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="scale-balanced" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                      <path fill="currentColor" d="M384 32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L398.4 96c-5.2 25.8-22.9 47.1-46.4 57.3L352 448l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0 0-294.7c-23.5-10.3-41.2-31.6-46.4-57.3L128 96c-17.7 0-32-14.3-32-32s14.3-32 32-32l128 0c14.6-19.4 37.8-32 64-32s49.4 12.6 64 32zm55.6 288l144.9 0L512 195.8 439.6 320zM512 416c-62.9 0-115.2-34-126-78.9c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C627.2 382 574.9 416 512 416zM126.8 195.8L54.4 320l144.9 0L126.8 195.8zM.9 337.1c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C242 382 189.7 416 126.8 416S11.7 382 .9 337.1z">
                      </path>
                    </svg>
                    Fair Use Policy
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1 mx-auto">
                Social
              </h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://discord.gg/nM8WKPAvsW">
                    <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="discord" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                      <path fill="currentColor" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z">
                      </path>
                    </svg>
                    Discord
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://github.com/Silly-Development">
                    <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                      <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z">
                      </path>
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center justify-center" href="https://x.com/sillydevelop">
                    <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z">
                      </path>
                    </svg>
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center sm:items-start space-y-4">
              <div className="flex items-center space-x-3">
                <img alt="Silly Development Logo" loading="lazy" width="60" height="60" decoding="async" data-nimg="1" className="rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300" style={{color: 'transparent'}} src="/assets/axiom-logo.png" />
                <span className="text-white font-bold text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Axiom
                </span>
              </div>
              <p className="text-gray-400 text-sm text-center sm:text-left max-w-xs">
                We are a small advertising provider focused on providing the best service we can to our thousands of users.
              </p>
            </div>
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/your-servers">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="server" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 32zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM64 288c-35.3 0-64 28.7-64 64l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 288zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm56 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"></path>
                  </svg>
                  Advertise server
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/your-bots">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="robot" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> 
                    <path fill="currentColor" d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"></path>
                  </svg>
                  Advertise Bots
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/advertise">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"></path>
                  </svg>
                  More Services
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/about-us">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="building" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path fill="currentColor" d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c26.5 0 48-21.5 48-48l0-416c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16z"></path>
                  </svg>
                  About Us
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/help">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sitemap" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                    <path fill="currentColor" d="M208 80c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-8 0 0 40 152 0c30.9 0 56 25.1 56 56l0 32 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-32c0-4.4-3.6-8-8-8l-152 0 0 40 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-40-152 0c-4.4 0-8 3.6-8 8l0 32 8 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l8 0 0-32c0-30.9 25.1-56 56-56l152 0 0-40-8 0c-26.5 0-48-21.5-48-48l0-64z"></path>
                  </svg>
                  Help
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/support-ticket">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gauge-high" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM256 416c35.3 0 64-28.7 64-64c0-17.4-6.9-33.1-18.1-44.6L366 161.7c5.3-12.1-.2-26.3-12.3-31.6s-26.3 .2-31.6 12.3L257.9 288c-.6 0-1.3 0-1.9 0c-35.3 0-64 28.7-64 64s28.7 64 64 64zM176 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM96 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm352-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
                  </svg>
                  Support Ticket
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="privacy-policy">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor" d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"></path>
                  </svg>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/terms-of-service">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gavel" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M318.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-120 120c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l4-4L325.4 293.4l-4 4c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l120-120c12.5-12.5 12.5-32.8 0-45.3l-16-16c-12.5-12.5-32.8-12.5-45.3 0l-4 4L330.6 74.6l4-4c12.5-12.5 12.5-32.8 0-45.3l-16-16zm-152 288c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l48 48c12.5 12.5 32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-1.4-1.4L272 285.3 226.7 240 168 298.7l-1.4-1.4z"></path>
                  </svg>
                  Terms Of Service
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center" href="/fair-use-policy">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="scale-balanced" className="text-indigo-400 mr-2 w-3 h-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path fill="currentColor" d="M384 32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L398.4 96c-5.2 25.8-22.9 47.1-46.4 57.3L352 448l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0 0-294.7c-23.5-10.3-41.2-31.6-46.4-57.3L128 96c-17.7 0-32-14.3-32-32s14.3-32 32-32l128 0c14.6-19.4 37.8-32 64-32s49.4 12.6 64 32zm55.6 288l144.9 0L512 195.8 439.6 320zM512 416c-62.9 0-115.2-34-126-78.9c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C627.2 382 574.9 416 512 416zM126.8 195.8L54.4 320l144.9 0L126.8 195.8zM.9 337.1c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C242 382 189.7 416 126.8 416S11.7 382 .9 337.1z"></path>
                  </svg>
                  Fair Use Policy
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-indigo-600 after:mt-1">
              Social
            </h3>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center" href="https://discord.gg/sE8E3gYG">
                  <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="discord" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path fill="currentColor" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                  </svg>
                  Discord
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center" href="https://discord.gg/sE8E3gYG">
                  <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                    <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                  </svg>
                  Github
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center" href="x.com/Axiomadvertises">
                  <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" className="text-indigo-400 mr-2 w-3 h-3 flex-shrink-0" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                  </svg>
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">
            2025 - 2025 - Axiom
          </p>
          <p className="text-gray-400 text-sm text-center mt-2">
            Made with ❤️ by 
            <a href="https://discord.gg/sE8E3gYG" className="hover:text-white transition-all duration-200">
              Axiom
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
