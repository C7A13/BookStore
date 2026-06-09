import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="h-12 flex items-center justify-center text-sm border-t bg-white border-gray-200 text-gray-600">
            © 2025{" "}
            <span className="font-semibold mx-1 text-gray-800">
                Libro Admin
            </span>
            {" | Powered by "}
            <span className="font-medium ml-1 text-blue-600 hover:underline cursor-pointer">
                Libro Team
            </span>
        </footer>
    );
};

export default Footer;