import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import Services from '@/components/home/Services';
import Location from '@/components/home/Location';
import Footer from '@/components/layout/Footer';

export default function Home() {
    return (
        <main>
            <Navbar />
            <Hero />
            <Services />
            <Location />
            <About />
            <Footer />
        </main>
    );
}
