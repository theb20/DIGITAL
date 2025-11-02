import { ArrowRight, Leaf, Phone } from 'lucide-react';

export default function ContactBanner() {
  return (
    <div className="relative bg-white overflow-hidden">
      
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 before:absolute before:inset-0 before:bg-black/50 before:backdrop-blur-md"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80)'
        }}
      ></div>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Texte */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 rounded-full border border-black/20">
              <Leaf className="w-4 h-4 text-white/80" />
              <span className="text-sm font-semibold text-white/80">
                Restons connectés
              </span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Contactez-nous
              <span className="block text-green-600 mt-2">
                dès maintenant
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre projet digital.
            </p>

            {/* Bouton */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-black/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Contactez-nous
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-black/40 hover:text-black/80 transition-all duration-300">
                En savoir plus
              </button>
            </div>

            
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://i.pinimg.com/736x/22/f4/18/22f418c7c11c3c8301ffe503b9aa9ac4.jpg"
                alt="Nature durable"
                className="w-full h-[500px] object-cover"
              />
              
              {/* Overlay Cards */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                <a href='https://wa.me/33610694708' className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <svg viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Whatsapp-color</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Color-" transform="translate(-700.000000, -360.000000)" fill="#67C15E"> <path d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z" id="Whatsapp"> </path> </g> </g> </g></svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-900">Whatsapp</div>
                </a>
                
                <a href='mailto:servicedigitalplus@protons.me' className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-label="Gmail" role="img" viewBox="0 0 512 512" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="512" height="512" rx="15%" fill="#ffffff"></rect><path d="M158 391v-142l-82-63V361q0 30 30 30" fill="#4285f4"></path><path d="M 154 248l102 77l102-77v-98l-102 77l-102-77" fill="#ea4335"></path><path d="M354 391v-142l82-63V361q0 30-30 30" fill="#34a853"></path><path d="M76 188l82 63v-98l-30-23c-27-21-52 0-52 26" fill="#c5221f"></path><path d="M436 188l-82 63v-98l30-23c27-21 52 0 52 26" fill="#fbbc04"></path></g></svg>
                    
                  </div>
                  <div className="text-xs font-semibold text-gray-900">Adresse mail</div>
                </a>
                
                <a href='tel:+2250758452276' className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-xs font-semibold text-gray-900">Téléphone</div>
                </a>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full blur-2xl opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f0fdf4" fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}