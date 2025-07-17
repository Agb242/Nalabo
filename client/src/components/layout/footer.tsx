import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-blue-800 dark:bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg shadow-lg">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-8-5zM12 4.44L18.18 7 12 10.56 5.82 7 12 4.44zM4 8.18l7 4.08v8.34c-3.94-.64-7-4.19-7-8.6v-3.82zm16 7.82c0 4.41-3.06 7.96-7 8.6v-8.34l7-4.08v3.82z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Nalabo</h3>
                <p className="text-sm text-blue-200">Plateforme Cloud-Native de Workshops Tech</p>
              </div>
            </div>
            <p className="text-blue-200 dark:text-gray-300 mb-4">
              Nalabo révolutionne l'apprentissage technologique avec des ateliers interactifs, 
              des environnements containerisés et une approche "hands-on" immersive en français.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 dark:text-gray-300 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 dark:text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 dark:text-gray-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Plateforme</h4>
            <ul className="space-y-2 text-blue-200 dark:text-gray-300">
              <li><a href="#" className="hover:text-white">Ateliers</a></li>
              <li><a href="#" className="hover:text-white">Marketplace</a></li>
              <li><a href="#" className="hover:text-white">Communauté</a></li>
              <li><a href="#" className="hover:text-white">Certifications</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-blue-200 dark:text-gray-300">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-700 dark:border-gray-700 mt-8 pt-8 text-center text-blue-200 dark:text-gray-300">
          <p>&copy; 2024 Nalabo. Tous droits réservés. Fait avec ❤️ en France.</p>
        </div>
      </div>
    </footer>
  );
}
