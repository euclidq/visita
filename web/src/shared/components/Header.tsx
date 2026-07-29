import Logo from '../../assets/visita_horizontal_white.png';

const Header = () => {
    return (
        <header className="bg-blue-500 p-4 text-center">
            <img src={Logo} alt="Logo" className="mx-auto h-12" />
        </header>
    );
};

export default Header;
