import BallTimeline from "./BallTimeline";
import InningsHero from "./InningsHero";
import BattingCard from "./BattingCard";
import BowlingCard from "./BowlingCard";
import FallOfWickets from "./FallOfWickets";
import ExtrasCard from "./ExtrasCard";
import { InningsScorecard as InningsScorecardType } from "@/types/scorecard";

const InningsScorecard = ({ innings }: { innings: InningsScorecardType }) => {
  return (
    <>
      <InningsHero innings={innings} />
      <BattingCard innings={innings} />
      <BowlingCard innings={innings} />
      <FallOfWickets innings={innings} />
      <ExtrasCard innings={innings} />
      <BallTimeline innings={innings} />
    </>
  );
};

export default InningsScorecard;
