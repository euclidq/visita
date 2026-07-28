import Logo from '../../assets/visita_horizontal_white.png';

const Header = () => {
    return (
        <header className="bg-blue-500 p-4 text-center">
            <button onClick={() => { window.location.href = "/visita"; }}>
                <img src={Logo} alt="Logo" className="mx-auto h-12" />
            </button>
        </header>
    );
};

export default Header;
