import ExpandableLogo from "../ExpandableLogo";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center bg-transparent pointer-events-none">
            <ExpandableLogo />
        </nav>
    );
}
