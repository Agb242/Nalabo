import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-blue-800 dark:bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Nalabo</h3>
                <p className="text-sm text-blue-200">L'alternative française à Educates.dev</p>
              </div>
            </div>
            <p className="text-blue-200 dark:text-gray-300 mb-4">
              Plateforme cloud-native pour l'apprentissage technologique immersif. 
              Créez, partagez et suivez des workshops tech avec des environnements containerisés.
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
