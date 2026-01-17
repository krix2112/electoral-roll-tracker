import { NewHeader } from '../components/home_redesign/NewHeader';
import { NewHero } from '../components/home_redesign/NewHero';
import { NewChallenges } from '../components/home_redesign/NewChallenges';
import { NewFeatures } from '../components/home_redesign/NewFeatures';
import { NewAbout } from '../components/home_redesign/NewAbout';
import { NewFooter } from '../components/home_redesign/NewFooter';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NewHeader />
      <NewHero />
      <NewFeatures />
      <NewAbout />
      <NewChallenges />
      <NewFooter />
    </div>
  );
}

export default Home;
