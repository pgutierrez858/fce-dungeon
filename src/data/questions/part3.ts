import type { Part3Question } from "../../types";

// ─────────────────────────────────────────────────────────────────────────────
// FCE USE OF ENGLISH — PART 3 (Word Formation)
// 200 questions total: original 50 (revised) + 150 new.
//
// Disambiguation policy:
//   • Every sentence contains enough context to rule out the most likely
//     alternative derivation (un- vs no prefix, -ful vs -less, -ing vs -ed, etc.)
//   • Negative-prefix answers always include a clear negative signal in context.
//   • Positive-form answers include a confirming positive signal.
//   • All IDs are unique (q3-01 … q3-200).
// ─────────────────────────────────────────────────────────────────────────────

export const PART3_ALL: Part3Question[] = [
  // ══════════════════════════════════════════════════════════════════════
  // ORIGINAL 50 — revised for unambiguity
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "q3-01",
    type: "t3",
    sentence:
      "She has always been a very ______ friend — I know I can always count on her.",
    stem: "RELY",
    answer: "reliable",
    tip: "RELY → reliable (-able adjective; y → i).",
  },
  {
    id: "q3-02",
    type: "t3",
    sentence:
      "Standing in the long queue for two hours tested his ______ to the limit.",
    stem: "PATIENT",
    answer: "patience",
    tip: "PATIENT → patience (-ce noun).",
  },
  {
    id: "q3-03",
    type: "t3",
    sentence:
      "The magician's sudden ______ behind a cloud of smoke startled the entire crowd.",
    stem: "APPEAR",
    answer: "disappearance",
    tip: "APPEAR → disappearance (dis- + -ance); the magician vanished.",
  },
  {
    id: "q3-04",
    type: "t3",
    sentence:
      "The factory closure caused widespread ______ across the region, with thousands losing their jobs.",
    stem: "EMPLOY",
    answer: "unemployment",
    tip: "EMPLOY → unemployment (un- + -ment).",
  },
  {
    id: "q3-05",
    type: "t3",
    sentence:
      "Advances in technology have turned what once seemed a dream into a real ______.",
    stem: "POSSIBLE",
    answer: "possibility",
    tip: "POSSIBLE → possibility (drop -le, add -ility).",
  },
  {
    id: "q3-06",
    type: "t3",
    sentence:
      "After months of deliberation, she finally made the ______ to quit her job and travel.",
    stem: "DECIDE",
    answer: "decision",
    tip: "DECIDE → decision (drop -e, add -sion).",
  },
  {
    id: "q3-07",
    type: "t3",
    sentence:
      "Everyone was shocked by his ______ behaviour — he had always seemed so trustworthy.",
    stem: "HONEST",
    answer: "dishonest",
    tip: 'HONEST → dishonest (dis-); "shocked" + "always seemed trustworthy" confirm dis-.',
  },
  {
    id: "q3-08",
    type: "t3",
    sentence:
      "She read through every clause of the contract ______ before putting pen to paper.",
    stem: "CARE",
    answer: "carefully",
    tip: "CARE → carefully (careful + -ly).",
  },
  {
    id: "q3-09",
    type: "t3",
    sentence:
      "It was ______ warm for October — people were still sitting outside in cafés.",
    stem: "USUAL",
    answer: "unusually",
    tip: 'USUAL → unusually (un- + -ly); "for October" confirms abnormal warmth.',
  },
  {
    id: "q3-10",
    type: "t3",
    sentence:
      "Without a diagram to illustrate the steps, the instructions were completely ______.",
    stem: "COMPREHEND",
    answer: "incomprehensible",
    tip: "COMPREHEND → incomprehensible (in- + -ible).",
  },
  {
    id: "q3-11",
    type: "t3",
    sentence:
      "Her ______ of ancient history, covering thousands of texts, was truly impressive.",
    stem: "KNOW",
    answer: "knowledge",
    tip: "KNOW → knowledge (irregular noun).",
  },
  {
    id: "q3-12",
    type: "t3",
    sentence:
      "The teacher did her best to ______ her students to read more widely outside class.",
    stem: "COURAGE",
    answer: "encourage",
    tip: "COURAGE → encourage (en- prefix).",
  },
  {
    id: "q3-13",
    type: "t3",
    sentence:
      "The new hospital wing was opened with a grand ______ attended by hundreds of guests.",
    stem: "CELEBRATE",
    answer: "celebration",
    tip: "CELEBRATE → celebration (-tion noun).",
  },
  {
    id: "q3-14",
    type: "t3",
    sentence:
      "After the incident he was called into the office and given a formal ______.",
    stem: "WARN",
    answer: "warning",
    tip: "WARN → warning (-ing noun).",
  },
  {
    id: "q3-15",
    type: "t3",
    sentence:
      "She is known throughout the industry for her ______ in finding solutions nobody else had thought of.",
    stem: "CREATIVE",
    answer: "creativity",
    tip: "CREATIVE → creativity (drop -e, add -ity).",
  },
  {
    id: "q3-16",
    type: "t3",
    sentence:
      "He has a reputation for being completely ______, so nobody ever trusted him with important tasks.",
    stem: "RELIABLE",
    answer: "unreliable",
    tip: 'RELIABLE → unreliable (un-); "nobody trusted him" confirms un-.',
  },
  {
    id: "q3-17",
    type: "t3",
    sentence:
      "Despite being only nineteen, she handled the difficult situation with great ______.",
    stem: "MATURE",
    answer: "maturity",
    tip: "MATURE → maturity (drop -e, add -ity).",
  },
  {
    id: "q3-18",
    type: "t3",
    sentence:
      "The holiday was a total ______ — the hotel was dirty and it rained every single day.",
    stem: "DISAPPOINT",
    answer: "disappointment",
    tip: "DISAPPOINT → disappointment (-ment noun).",
  },
  {
    id: "q3-19",
    type: "t3",
    sentence:
      "Even under enormous pressure she showed great ______, remaining calm and focused throughout.",
    stem: "PROFESSION",
    answer: "professionalism",
    tip: "PROFESSION → professionalism (-al + -ism).",
  },
  {
    id: "q3-20",
    type: "t3",
    sentence:
      "It was an ______ display of technical skill by the young musician on her debut night.",
    stem: "IMPRESS",
    answer: "impressive",
    tip: "IMPRESS → impressive (-ive adjective).",
  },
  {
    id: "q3-21",
    type: "t3",
    sentence:
      "The ______ of the new bypass has divided local opinion for months.",
    stem: "CONSTRUCT",
    answer: "construction",
    tip: "CONSTRUCT → construction (-ion noun).",
  },
  {
    id: "q3-22",
    type: "t3",
    sentence:
      "She was praised for her highly ______ approach, which no one in the field had tried before.",
    stem: "INNOVATE",
    answer: "innovative",
    tip: "INNOVATE → innovative (-ive adjective).",
  },
  {
    id: "q3-23",
    type: "t3",
    sentence:
      "The president's ______ announcement took everyone completely by surprise — nobody had foreseen it.",
    stem: "EXPECT",
    answer: "unexpected",
    tip: 'EXPECT → unexpected (un- + past participle adjective); "by surprise" confirms un-.',
  },
  {
    id: "q3-24",
    type: "t3",
    sentence:
      "The students showed great ______ when presenting their projects to an audience of experts.",
    stem: "CONFIDENT",
    answer: "confidence",
    tip: "CONFIDENT → confidence (-ce noun).",
  },
  {
    id: "q3-25",
    type: "t3",
    sentence:
      "He showed remarkable ______ after losing his job, quickly finding new opportunities.",
    stem: "RESILIENT",
    answer: "resilience",
    tip: "RESILIENT → resilience (-ce noun).",
  },
  {
    id: "q3-26",
    type: "t3",
    sentence:
      "The government promised to ______ the outdated education system from top to bottom.",
    stem: "FORM",
    answer: "reform",
    tip: "FORM → reform (re- = change for the better).",
  },
  {
    id: "q3-27",
    type: "t3",
    sentence:
      "The film received ______ praise, with positive reviews appearing in every country where it was shown.",
    stem: "WIDE",
    answer: "widespread",
    tip: 'WIDE → widespread (compound adjective modifying "praise"; not an adverb).',
  },
  {
    id: "q3-28",
    type: "t3",
    sentence:
      "All new staff were required to attend a ______ session on health and safety before starting work.",
    stem: "BRIEF",
    answer: "briefing",
    tip: "BRIEF → briefing (-ing noun = informational session).",
  },
  {
    id: "q3-29",
    type: "t3",
    sentence:
      "The council expressed deep ______ about the proposed plans, fearing their impact on residents.",
    stem: "ANXIOUS",
    answer: "anxiety",
    tip: "ANXIOUS → anxiety (drop -ous, add -ety; irregular).",
  },
  {
    id: "q3-30",
    type: "t3",
    sentence:
      "Despite recent setbacks, the manager remained ______ about the outcome of the negotiations.",
    stem: "OPTIMISM",
    answer: "optimistic",
    tip: 'OPTIMISM → optimistic (-istic adjective); "despite setbacks" confirms the positive adjective.',
  },
  {
    id: "q3-31",
    type: "t3",
    sentence:
      "His ______ in the face of repeated failure and rejection over many years was truly admirable.",
    stem: "PERSIST",
    answer: "persistence",
    tip: "PERSIST → persistence (-ence noun).",
  },
  {
    id: "q3-32",
    type: "t3",
    sentence:
      "She submitted her ______ for the teaching position online last Monday morning.",
    stem: "APPLY",
    answer: "application",
    tip: "APPLY → application (y → ication).",
  },
  {
    id: "q3-33",
    type: "t3",
    sentence:
      "Many customers were ______ with the service, despite having waited over an hour to be seen.",
    stem: "SATISFY",
    answer: "dissatisfied",
    tip: 'SATISFY → dissatisfied (dis- + satisfied); "despite waiting over an hour" confirms dis-.',
  },
  {
    id: "q3-34",
    type: "t3",
    sentence:
      "She accepted full ______ for the error in the report and apologised publicly.",
    stem: "RESPONSIBLE",
    answer: "responsibility",
    tip: "RESPONSIBLE → responsibility (drop -le, add -ility).",
  },
  {
    id: "q3-35",
    type: "t3",
    sentence:
      "The company launched a new ______ venture specifically designed to attract younger consumers.",
    stem: "COMMERCE",
    answer: "commercial",
    tip: "COMMERCE → commercial (-ial adjective; drop -e).",
  },
  {
    id: "q3-36",
    type: "t3",
    sentence:
      "She felt incredibly ______ during her first months after moving to a city where she knew nobody.",
    stem: "LONE",
    answer: "lonely",
    tip: "LONE → lonely (-ly suffix).",
  },
  {
    id: "q3-37",
    type: "t3",
    sentence:
      "The soldier was awarded a medal for his outstanding ______ in the face of extreme danger.",
    stem: "BRAVE",
    answer: "bravery",
    tip: "BRAVE → bravery (drop -e, add -ery).",
  },
  {
    id: "q3-38",
    type: "t3",
    sentence:
      "Winning the championship at just sixteen was an extraordinary ______ for such a young athlete.",
    stem: "ACHIEVE",
    answer: "achievement",
    tip: "ACHIEVE → achievement (drop -e, add -ment).",
  },
  {
    id: "q3-39",
    type: "t3",
    sentence:
      "The ______ caused by the earthquake left thousands of families without homes or clean water.",
    stem: "DESTROY",
    answer: "destruction",
    tip: "DESTROY → destruction (-uction; irregular).",
  },
  {
    id: "q3-40",
    type: "t3",
    sentence:
      "His flat ______ to cooperate with the investigation shocked even his closest colleagues.",
    stem: "REFUSE",
    answer: "refusal",
    tip: "REFUSE → refusal (-al noun suffix).",
  },
  {
    id: "q3-41",
    type: "t3",
    sentence:
      "The weather conditions were completely ______ for the expedition, so the team postponed their departure.",
    stem: "FAVOUR",
    answer: "unfavourable",
    tip: 'FAVOUR → unfavourable (un- + -able); "postponed" confirms bad conditions.',
  },
  {
    id: "q3-42",
    type: "t3",
    sentence:
      "Her constant ______ — she was always doubting her own abilities — made it difficult to work with her.",
    stem: "SECURE",
    answer: "insecurity",
    tip: 'SECURE → insecurity (in- + security); "doubting" confirms in-.',
  },
  {
    id: "q3-43",
    type: "t3",
    sentence:
      "He had always planned to travel the world and pursue his hobbies after his ______.",
    stem: "RETIRE",
    answer: "retirement",
    tip: "RETIRE → retirement (drop -e, add -ment).",
  },
  {
    id: "q3-44",
    type: "t3",
    sentence:
      "She tackled every task with tremendous ______, always eager to get started straight away.",
    stem: "ENTHUSE",
    answer: "enthusiasm",
    tip: "ENTHUSE → enthusiasm (-iasm; irregular).",
  },
  {
    id: "q3-45",
    type: "t3",
    sentence:
      "The library holds an ______ collection of rare manuscripts spanning over five centuries.",
    stem: "EXTEND",
    answer: "extensive",
    tip: "EXTEND → extensive (-ive adjective; -d drops).",
  },
  {
    id: "q3-46",
    type: "t3",
    sentence:
      "The young pianist gave a ______ debut performance that earned her a standing ovation.",
    stem: "REMARK",
    answer: "remarkable",
    tip: "REMARK → remarkable (-able adjective).",
  },
  {
    id: "q3-47",
    type: "t3",
    sentence:
      "The ______ of remote rural communities, cut off from services and transport, remains a major challenge.",
    stem: "ISOLATE",
    answer: "isolation",
    tip: "ISOLATE → isolation (drop -e, add -ion).",
  },
  {
    id: "q3-48",
    type: "t3",
    sentence:
      "The team made a ______ discovery that completely changed how scientists understand the disease.",
    stem: "GROUND",
    answer: "groundbreaking",
    tip: "GROUND → groundbreaking (compound adjective = revolutionary/pioneering).",
  },
  {
    id: "q3-49",
    type: "t3",
    sentence:
      "The full ______ of the crisis did not become apparent to the public until much later.",
    stem: "SERIOUS",
    answer: "seriousness",
    tip: "SERIOUS → seriousness (-ness noun).",
  },
  {
    id: "q3-50",
    type: "t3",
    sentence:
      "She hoped her research would make a ______ contribution to our understanding of climate change.",
    stem: "MEANING",
    answer: "meaningful",
    tip: "MEANING → meaningful (-ful suffix).",
  },

  // ══════════════════════════════════════════════════════════════════════
  // 150 NEW QUESTIONS (q3-51 … q3-200)
  // ══════════════════════════════════════════════════════════════════════

  // Negative: un-
  {
    id: "q3-51",
    type: "t3",
    sentence:
      "The map was completely ______ — it had no labels, no scale, and pointed the wrong way.",
    stem: "USE",
    answer: "useless",
    tip: "USE → useless (-less = without use).",
  },
  {
    id: "q3-52",
    type: "t3",
    sentence:
      "He was deeply ______ with his exam results and vowed to work much harder the following year.",
    stem: "HAPPY",
    answer: "unhappy",
    tip: 'HAPPY → unhappy (un-); "deeply" + negative outcome confirm un-.',
  },
  {
    id: "q3-53",
    type: "t3",
    sentence:
      "The blocked road made it completely ______ for ambulances to reach the accident scene.",
    stem: "POSSIBLE",
    answer: "impossible",
    tip: "POSSIBLE → impossible (im- before p); blocked road confirms negative.",
  },
  {
    id: "q3-54",
    type: "t3",
    sentence:
      "She felt ______ in the new city and struggled to make friends for many months.",
    stem: "SETTLE",
    answer: "unsettled",
    tip: 'SETTLE → unsettled (un-); "struggled" confirms negative.',
  },
  {
    id: "q3-55",
    type: "t3",
    sentence:
      "The journalist published several ______ claims that were later proven to be completely false.",
    stem: "FOUND",
    answer: "unfounded",
    tip: 'FOUND → unfounded (un- + past participle); "proven false" confirms un-.',
  },
  {
    id: "q3-56",
    type: "t3",
    sentence:
      "The timetable was totally ______ to students — none of them could make sense of it.",
    stem: "CLEAR",
    answer: "unclear",
    tip: 'CLEAR → unclear (un-); "none could make sense of it" confirms negative.',
  },

  // Negative: in- / im- / il- / ir-
  {
    id: "q3-57",
    type: "t3",
    sentence:
      "The two scientists reached completely ______ conclusions from the same data, contradicting each other.",
    stem: "COMPATIBLE",
    answer: "incompatible",
    tip: 'COMPATIBLE → incompatible (in- before c); "contradicting" confirms negative.',
  },
  {
    id: "q3-58",
    type: "t3",
    sentence:
      "Crossing the border without a visa is ______ and can result in immediate arrest.",
    stem: "LEGAL",
    answer: "illegal",
    tip: 'LEGAL → illegal (il- before l); "arrest" confirms negative.',
  },
  {
    id: "q3-59",
    type: "t3",
    sentence:
      "The handwriting was so tiny and messy that it was completely ______ even with glasses on.",
    stem: "LEGIBLE",
    answer: "illegible",
    tip: 'LEGIBLE → illegible (il- before l); "even with glasses" confirms negative.',
  },
  {
    id: "q3-60",
    type: "t3",
    sentence:
      "It would be completely ______ to expect results after only a single day of practice.",
    stem: "REALISTIC",
    answer: "unrealistic",
    tip: 'REALISTIC → unrealistic (un-); "only a single day" confirms absurdity.',
  },
  {
    id: "q3-61",
    type: "t3",
    sentence:
      "The damage to the ancient manuscript was sadly ______ — nothing could ever be done to restore it.",
    stem: "REPAIR",
    answer: "irreparable",
    tip: 'REPAIR → irreparable (ir- before r; -able); "nothing could be done" confirms ir-.',
  },
  {
    id: "q3-62",
    type: "t3",
    sentence:
      "She was completely ______ of the dangers ahead until it was almost too late to turn back.",
    stem: "AWARE",
    answer: "unaware",
    tip: 'AWARE → unaware (un-); "until too late" confirms negative.',
  },

  // -ness
  {
    id: "q3-63",
    type: "t3",
    sentence:
      "The doctor noted the unusual ______ of the bruise, which suggested an underlying condition.",
    stem: "DARK",
    answer: "darkness",
    tip: "DARK → darkness (-ness noun).",
  },
  {
    id: "q3-64",
    type: "t3",
    sentence:
      "There was a real ______ about her performance that moved many audience members to tears.",
    stem: "SAD",
    answer: "sadness",
    tip: "SAD → sadness (-ness; double d).",
  },
  {
    id: "q3-65",
    type: "t3",
    sentence:
      "His ______ in business negotiations was legendary — he always secured the best deal.",
    stem: "SHARP",
    answer: "sharpness",
    tip: "SHARP → sharpness (-ness noun).",
  },
  {
    id: "q3-66",
    type: "t3",
    sentence:
      "The doctor stressed that regular exercise was essential for maintaining good mental ______.",
    stem: "FIT",
    answer: "fitness",
    tip: "FIT → fitness (-ness; double t).",
  },
  {
    id: "q3-67",
    type: "t3",
    sentence:
      "Voters were drawn to her ______ — she always said exactly what she thought, however uncomfortable.",
    stem: "DIRECT",
    answer: "directness",
    tip: "DIRECT → directness (-ness noun).",
  },

  // -ment
  {
    id: "q3-68",
    type: "t3",
    sentence:
      "The government announced new measures to stimulate economic ______ in the most deprived areas.",
    stem: "DEVELOP",
    answer: "development",
    tip: "DEVELOP → development (-ment noun).",
  },
  {
    id: "q3-69",
    type: "t3",
    sentence:
      "There was general ______ among the staff that the new system was far too complicated.",
    stem: "AGREE",
    answer: "disagreement",
    tip: 'AGREE → disagreement (dis- + -ment); "too complicated" confirms dis-.',
  },
  {
    id: "q3-70",
    type: "t3",
    sentence:
      "His ______ with the new role grew steadily over his first few months at the company.",
    stem: "ENGAGE",
    answer: "engagement",
    tip: "ENGAGE → engagement (drop -e, add -ment).",
  },
  {
    id: "q3-71",
    type: "t3",
    sentence:
      "The athlete expressed his ______ at being dropped from the squad despite his excellent recent form.",
    stem: "DISAPPOINT",
    answer: "disappointment",
    tip: "DISAPPOINT → disappointment (-ment noun).",
  },

  // -ion / -tion / -sion / -ation
  {
    id: "q3-72",
    type: "t3",
    sentence:
      "The ______ of the old city centre took many years and cost millions of pounds.",
    stem: "RESTORE",
    answer: "restoration",
    tip: "RESTORE → restoration (drop -e, add -ation).",
  },
  {
    id: "q3-73",
    type: "t3",
    sentence:
      "She struggled to hide her ______ when the train was delayed for the third time.",
    stem: "FRUSTRATE",
    answer: "frustration",
    tip: "FRUSTRATE → frustration (drop -e, add -ion).",
  },
  {
    id: "q3-74",
    type: "t3",
    sentence:
      "The committee made a ______ among staff to raise funds for the local food bank.",
    stem: "COLLECT",
    answer: "collection",
    tip: "COLLECT → collection (-ion noun).",
  },
  {
    id: "q3-75",
    type: "t3",
    sentence:
      "Her extraordinary ______ to detail is what sets her apart from every other designer.",
    stem: "ATTEND",
    answer: "attention",
    tip: "ATTEND → attention (-tion noun; double t).",
  },
  {
    id: "q3-76",
    type: "t3",
    sentence:
      "The sudden ______ of the lead actor forced the director to recast the role overnight.",
    stem: "RESIGN",
    answer: "resignation",
    tip: "RESIGN → resignation (-ation noun).",
  },
  {
    id: "q3-77",
    type: "t3",
    sentence:
      "The judge noted several ______ between the two witnesses' accounts of the same event.",
    stem: "CONTRADICT",
    answer: "contradictions",
    tip: 'CONTRADICT → contradictions (-ion noun; plural for "several").',
  },
  {
    id: "q3-78",
    type: "t3",
    sentence:
      "The new law requires full financial ______ from all public officials on an annual basis.",
    stem: "DISCLOSE",
    answer: "disclosure",
    tip: "DISCLOSE → disclosure (drop -e, add -ure).",
  },
  {
    id: "q3-79",
    type: "t3",
    sentence:
      "The government announced its ______ to invest heavily in renewable energy over the next decade.",
    stem: "INTEND",
    answer: "intention",
    tip: "INTEND → intention (-tion noun).",
  },

  // -ance / -ence
  {
    id: "q3-80",
    type: "t3",
    sentence:
      "His outstanding ______ in the competition earned him a place in the national finals.",
    stem: "PERFORM",
    answer: "performance",
    tip: "PERFORM → performance (-ance noun).",
  },
  {
    id: "q3-81",
    type: "t3",
    sentence:
      "She found the constant ______ of her younger brother deeply irritating while trying to study.",
    stem: "INTERFERE",
    answer: "interference",
    tip: "INTERFERE → interference (drop -e, add -ence).",
  },
  {
    id: "q3-82",
    type: "t3",
    sentence:
      "A good level of ______ in both reading and writing is required for the post.",
    stem: "PROFICIENT",
    answer: "proficiency",
    tip: "PROFICIENT → proficiency (drop -t, add -cy).",
  },
  {
    id: "q3-83",
    type: "t3",
    sentence:
      "The company stressed the ______ of meeting the deadline, warning that delays would cost thousands.",
    stem: "IMPORTANT",
    answer: "importance",
    tip: "IMPORTANT → importance (drop -t, add -ce).",
  },
  {
    id: "q3-84",
    type: "t3",
    sentence:
      "Her appointment was welcomed by colleagues who had long admired her ______ and skill.",
    stem: "COMPETENT",
    answer: "competence",
    tip: "COMPETENT → competence (drop -t, add -ce).",
  },

  // -ity
  {
    id: "q3-85",
    type: "t3",
    sentence:
      "The full ______ of the task only became clear once they saw the mountain of paperwork.",
    stem: "COMPLEX",
    answer: "complexity",
    tip: "COMPLEX → complexity (add -ity).",
  },
  {
    id: "q3-86",
    type: "t3",
    sentence:
      "The report highlighted the shocking ______ between the richest and poorest areas of the city.",
    stem: "EQUAL",
    answer: "inequality",
    tip: 'EQUAL → inequality (in- + equality); "richest vs poorest" confirms in-.',
  },
  {
    id: "q3-87",
    type: "t3",
    sentence:
      "Scientists are concerned about the ______ of the drug — several trials have produced mixed results.",
    stem: "EFFECT",
    answer: "effectiveness",
    tip: 'EFFECT → effectiveness (-ive + -ness); noun required after "about the".',
  },
  {
    id: "q3-88",
    type: "t3",
    sentence:
      "There is a striking ______ between the two sisters, both in appearance and personality.",
    stem: "SIMILAR",
    answer: "similarity",
    tip: "SIMILAR → similarity (-ity noun suffix).",
  },

  // -ive
  {
    id: "q3-89",
    type: "t3",
    sentence:
      "The children were highly ______ throughout the workshop, always eager to take part.",
    stem: "ACT",
    answer: "active",
    tip: "ACT → active (-ive adjective).",
  },
  {
    id: "q3-90",
    type: "t3",
    sentence:
      "The documentary gave a very ______ view of the conflict, showing only one perspective.",
    stem: "SELECT",
    answer: "selective",
    tip: "SELECT → selective (-ive adjective).",
  },
  {
    id: "q3-91",
    type: "t3",
    sentence:
      "The new manager took a ______ approach, always consulting staff before making any decisions.",
    stem: "CONSULT",
    answer: "consultative",
    tip: "CONSULT → consultative (-ative adjective).",
  },
  {
    id: "q3-92",
    type: "t3",
    sentence:
      "She has always been extremely ______ and spots potential problems long before they become serious.",
    stem: "PERCEIVE",
    answer: "perceptive",
    tip: "PERCEIVE → perceptive (drop -ive, add -tive; irregular).",
  },

  // -ous / -ious
  {
    id: "q3-93",
    type: "t3",
    sentence:
      "The hike through the jungle was extremely ______ and required great physical endurance.",
    stem: "VIGOUR",
    answer: "vigorous",
    tip: "VIGOUR → vigorous (drop -r, add -ous; British spelling).",
  },
  {
    id: "q3-94",
    type: "t3",
    sentence:
      "She was clearly ______ of her colleague's promotion, even though she tried hard not to show it.",
    stem: "ENVY",
    answer: "envious",
    tip: "ENVY → envious (y → i + -ous).",
  },
  {
    id: "q3-95",
    type: "t3",
    sentence:
      "Mixing those two chemicals in a confined space is extremely ______ and must never be attempted.",
    stem: "HAZARD",
    answer: "hazardous",
    tip: "HAZARD → hazardous (-ous suffix).",
  },
  {
    id: "q3-96",
    type: "t3",
    sentence:
      "The scientist made a ______ discovery that put her on the front page of every newspaper.",
    stem: "FAME",
    answer: "famous",
    tip: "FAME → famous (drop -e, add -ous).",
  },

  // -ful / -less (disambiguation pairs)
  {
    id: "q3-97",
    type: "t3",
    sentence:
      "The guide was so clear and ______ that even a complete beginner could follow it easily.",
    stem: "HELP",
    answer: "helpful",
    tip: 'HELP → helpful (-ful); "so clear and ____" + easy result confirm -ful not -less.',
  },
  {
    id: "q3-98",
    type: "t3",
    sentence:
      "The puppy spent the afternoon being completely ______ — chewing furniture and knocking things over.",
    stem: "CARE",
    answer: "careless",
    tip: "CARE → careless (-less = without care); destructive behaviour confirms -less.",
  },
  {
    id: "q3-99",
    type: "t3",
    sentence:
      "She gave a ______ account of events, providing every detail the investigators had asked for.",
    stem: "THOUGHT",
    answer: "thoughtful",
    tip: 'THOUGHT → thoughtful (-ful); "every detail provided" confirms positive -ful.',
  },
  {
    id: "q3-100",
    type: "t3",
    sentence:
      "The police described the attack as completely ______ — there was absolutely no reason or motive.",
    stem: "MOTIVE",
    answer: "motiveless",
    tip: "MOTIVE → motiveless (-less = without motive).",
  },
  {
    id: "q3-101",
    type: "t3",
    sentence:
      "The repair was completely ______ — the technician said the laptop was beyond saving.",
    stem: "HOPE",
    answer: "hopeless",
    tip: 'HOPE → hopeless (-less); "beyond saving" confirms negative.',
  },
  {
    id: "q3-102",
    type: "t3",
    sentence:
      "The trainer gave a very ______ safety demonstration before the team began work on the site.",
    stem: "THOUGHT",
    answer: "thoughtful",
    tip: 'THOUGHT → thoughtful (-ful); "safety demonstration" + positive context confirm -ful.',
  },

  // -al
  {
    id: "q3-103",
    type: "t3",
    sentence:
      "She has a strong interest in ______ issues and hopes to become a politician one day.",
    stem: "POLITICS",
    answer: "political",
    tip: "POLITICS → political (-al; drop -s).",
  },
  {
    id: "q3-104",
    type: "t3",
    sentence:
      "Eating a ______ diet rich in fruit and vegetables is one of the best ways to stay healthy.",
    stem: "BALANCE",
    answer: "balanced",
    tip: 'BALANCE → balanced (past participle adjective; "diet" collocates with "balanced").',
  },
  {
    id: "q3-105",
    type: "t3",
    sentence:
      "The council argued that demolishing the old theatre would constitute ______ vandalism.",
    stem: "CULTURE",
    answer: "cultural",
    tip: "CULTURE → cultural (-al adjective).",
  },
  {
    id: "q3-106",
    type: "t3",
    sentence:
      "He was given a ______ sum of money as a reward for finding and handing in the wallet.",
    stem: "SUBSTANCE",
    answer: "substantial",
    tip: "SUBSTANCE → substantial (drop -ce, add -tial adjective).",
  },

  // Adverbs -ly
  {
    id: "q3-107",
    type: "t3",
    sentence:
      "She ______ agreed with everything he said, even though she privately thought he was wrong.",
    stem: "PUBLIC",
    answer: "publicly",
    tip: "PUBLIC → publicly (-ly; no extra k before -ly).",
  },
  {
    id: "q3-108",
    type: "t3",
    sentence:
      "The manager spoke ______ to the new recruit, putting her immediately at ease.",
    stem: "WARM",
    answer: "warmly",
    tip: "WARM → warmly (-ly adverb).",
  },
  {
    id: "q3-109",
    type: "t3",
    sentence:
      "He ______ denied any involvement in the theft when questioned by the police.",
    stem: "FIRM",
    answer: "firmly",
    tip: "FIRM → firmly (-ly adverb).",
  },
  {
    id: "q3-110",
    type: "t3",
    sentence:
      "After months of delays, the renovation was ______ completed before the winter set in.",
    stem: "FINAL",
    answer: "finally",
    tip: "FINAL → finally (-ly adverb).",
  },
  {
    id: "q3-111",
    type: "t3",
    sentence:
      "The project was ______ completed on time, thanks to the whole team's extraordinary efforts.",
    stem: "REMARK",
    answer: "remarkably",
    tip: "REMARK → remarkably (-ably adverb).",
  },
  {
    id: "q3-112",
    type: "t3",
    sentence:
      "It was ______ hot throughout August — temperatures broke records set fifty years ago.",
    stem: "EXCEPTION",
    answer: "exceptionally",
    tip: "EXCEPTION → exceptionally (drop -ion, add -ally).",
  },

  // Compound nouns / adjectives
  {
    id: "q3-113",
    type: "t3",
    sentence:
      "The new therapy represented a major ______ in the treatment of the disease.",
    stem: "BREAK",
    answer: "breakthrough",
    tip: "BREAK → breakthrough (compound noun = major advance).",
  },
  {
    id: "q3-114",
    type: "t3",
    sentence:
      "The new employee was very ______ and handled every complaint with patience and a smile.",
    stem: "APPROACH",
    answer: "approachable",
    tip: "APPROACH → approachable (-able = easy to talk to).",
  },
  {
    id: "q3-115",
    type: "t3",
    sentence:
      "She has a very ______ personality — she is always the first to introduce herself at any event.",
    stem: "OUT",
    answer: "outgoing",
    tip: "OUT → outgoing (compound adjective = sociable/friendly).",
  },
  {
    id: "q3-116",
    type: "t3",
    sentence:
      "The politician was accused of making ______ promises that he had no intention of keeping.",
    stem: "GROUND",
    answer: "groundless",
    tip: 'GROUND → groundless (-less); "no intention of keeping" confirms no foundation.',
  },

  // Re- prefix
  {
    id: "q3-117",
    type: "t3",
    sentence:
      "The government plans to ______ thousands of workers whose jobs have been taken by automation.",
    stem: "TRAIN",
    answer: "retrain",
    tip: "TRAIN → retrain (re- = train again).",
  },
  {
    id: "q3-118",
    type: "t3",
    sentence:
      "After the floods, the local council had to ______ the entire town centre from scratch.",
    stem: "BUILD",
    answer: "rebuild",
    tip: "BUILD → rebuild (re- = build again).",
  },
  {
    id: "q3-119",
    type: "t3",
    sentence:
      "The company decided to ______ its entire product range to appeal to a younger market.",
    stem: "BRAND",
    answer: "rebrand",
    tip: "BRAND → rebrand (re- = change the brand identity).",
  },

  // Over- / under-
  {
    id: "q3-120",
    type: "t3",
    sentence:
      "The report was heavily criticised for ______ the risks involved in the project.",
    stem: "ESTIMATE",
    answer: "underestimating",
    tip: 'ESTIMATE → underestimating (under- = estimate too low; gerund after "for").',
  },
  {
    id: "q3-121",
    type: "t3",
    sentence:
      "The restaurant was ______ — they had twice as many staff as they actually needed.",
    stem: "STAFF",
    answer: "overstaffed",
    tip: "STAFF → overstaffed (over- + past participle = too many staff).",
  },
  {
    id: "q3-122",
    type: "t3",
    sentence:
      "Many talented young players remain ______ because scouts rarely visit smaller clubs.",
    stem: "RATE",
    answer: "underrated",
    tip: "RATE → underrated (under- + past participle = not valued enough).",
  },

  // Self- prefix
  {
    id: "q3-123",
    type: "t3",
    sentence:
      "You need to be highly ______ to work from home effectively without any supervision.",
    stem: "DISCIPLINE",
    answer: "self-disciplined",
    tip: "DISCIPLINE → self-disciplined (self- + past participle).",
  },
  {
    id: "q3-124",
    type: "t3",
    sentence:
      "She came across as very ______ during the interview, never doubting her own ability.",
    stem: "ASSURE",
    answer: "self-assured",
    tip: "ASSURE → self-assured (self- + past participle = confident).",
  },

  // em- / en- prefix / -en verb suffix
  {
    id: "q3-125",
    type: "t3",
    sentence:
      "The charity aims to ______ local farmers by teaching them modern sustainable techniques.",
    stem: "POWER",
    answer: "empower",
    tip: "POWER → empower (em- = give power/agency to).",
  },
  {
    id: "q3-126",
    type: "t3",
    sentence:
      "The new scheme will ______ more young people to set up their own businesses.",
    stem: "ABLE",
    answer: "enable",
    tip: "ABLE → enable (en- = make possible).",
  },
  {
    id: "q3-127",
    type: "t3",
    sentence:
      "Scientists are working hard to ______ our understanding of the disease and its underlying causes.",
    stem: "DEEP",
    answer: "deepen",
    tip: "DEEP → deepen (-en verb suffix = increase/make deeper).",
  },

  // Person nouns: -er / -or / -ist / -ian
  {
    id: "q3-128",
    type: "t3",
    sentence:
      "She works as an ______ for a major publishing house, checking manuscripts for errors.",
    stem: "EDIT",
    answer: "editor",
    tip: "EDIT → editor (-or person suffix).",
  },
  {
    id: "q3-129",
    type: "t3",
    sentence:
      "He trained for years to become a concert ______ and eventually performed at Carnegie Hall.",
    stem: "PIANO",
    answer: "pianist",
    tip: "PIANO → pianist (-ist person suffix).",
  },
  {
    id: "q3-130",
    type: "t3",
    sentence:
      "As a professional ______, she spends months researching each story before publishing anything.",
    stem: "JOURNAL",
    answer: "journalist",
    tip: "JOURNAL → journalist (-ist person suffix).",
  },
  {
    id: "q3-131",
    type: "t3",
    sentence:
      "The gallery hired a ______ to assess the collection before it was put up for auction.",
    stem: "VALUE",
    answer: "valuer",
    tip: "VALUE → valuer (-er person suffix = one who values/assesses).",
  },
  {
    id: "q3-132",
    type: "t3",
    sentence:
      "She is a passionate animal rights ______ who campaigns tirelessly against animal experiments.",
    stem: "ACTIVE",
    answer: "activist",
    tip: "ACTIVE → activist (-ist person suffix).",
  },

  // Abstract nouns from verbs
  {
    id: "q3-133",
    type: "t3",
    sentence:
      "Her ______ to the new role was welcomed by colleagues who had long admired her work.",
    stem: "APPOINT",
    answer: "appointment",
    tip: "APPOINT → appointment (-ment noun).",
  },
  {
    id: "q3-134",
    type: "t3",
    sentence:
      "The sudden ______ of support for the party surprised even its most loyal members.",
    stem: "WITHDRAW",
    answer: "withdrawal",
    tip: "WITHDRAW → withdrawal (-al noun; irregular spelling).",
  },
  {
    id: "q3-135",
    type: "t3",
    sentence:
      "The athlete's total ______ to training twice a day, seven days a week, was extraordinary.",
    stem: "COMMIT",
    answer: "commitment",
    tip: "COMMIT → commitment (-ment; double t).",
  },
  {
    id: "q3-136",
    type: "t3",
    sentence:
      "She showed great ______ in completing the marathon despite suffering from a knee injury.",
    stem: "DETERMINE",
    answer: "determination",
    tip: "DETERMINE → determination (drop -e, add -ation).",
  },
  {
    id: "q3-137",
    type: "t3",
    sentence:
      "The ______ of two senior managers in one week caused disruption across the whole department.",
    stem: "RESIGN",
    answer: "resignation",
    tip: "RESIGN → resignation (-ation noun).",
  },

  // Abstract nouns from adjectives
  {
    id: "q3-138",
    type: "t3",
    sentence:
      "Her genuine ______ for the subject is what makes her lectures so enjoyable to attend.",
    stem: "PASSIONATE",
    answer: "passion",
    tip: 'PASSIONATE → passion (drop -ate; base noun is "passion").',
  },
  {
    id: "q3-139",
    type: "t3",
    sentence:
      "The ______ of the countryside in that region is simply breathtaking in every season.",
    stem: "BEAUTIFUL",
    answer: "beauty",
    tip: "BEAUTIFUL → beauty (drop -iful, add -y; irregular).",
  },
  {
    id: "q3-140",
    type: "t3",
    sentence:
      "He gradually lost his ______ after months of repeated setbacks with no sign of improvement.",
    stem: "CONFIDENT",
    answer: "confidence",
    tip: "CONFIDENT → confidence (drop -t, add -ce).",
  },

  // Adjectives from nouns
  {
    id: "q3-141",
    type: "t3",
    sentence:
      "She has always had a very ______ lifestyle, always dining at the finest and most expensive restaurants.",
    stem: "LUXURY",
    answer: "luxurious",
    tip: "LUXURY → luxurious (drop -y, add -ious).",
  },
  {
    id: "q3-142",
    type: "t3",
    sentence:
      "The documentary gave a very ______ account of village life, avoiding all clichés.",
    stem: "REALISM",
    answer: "realistic",
    tip: "REALISM → realistic (drop -m, add -tic).",
  },
  {
    id: "q3-143",
    type: "t3",
    sentence:
      "The film received very ______ reviews — critics could not agree whether it was brilliant or terrible.",
    stem: "DIVIDE",
    answer: "divisive",
    tip: "DIVIDE → divisive (drop -e, add -ive = causing strong disagreement).",
  },
  {
    id: "q3-144",
    type: "t3",
    sentence:
      "The documentary was praised for its deeply ______ portrayal of life in deprived inner-city areas.",
    stem: "SYMPATHY",
    answer: "sympathetic",
    tip: "SYMPATHY → sympathetic (drop -y, add -etic).",
  },

  // -ing vs -ed adjectives (with disambiguation)
  {
    id: "q3-145",
    type: "t3",
    sentence:
      "She found the two-hour train journey completely ______ and could not sit still for a moment.",
    stem: "BORE",
    answer: "boring",
    tip: "BORE → boring (-ing active adjective; the journey caused the boredom, not the person).",
  },
  {
    id: "q3-146",
    type: "t3",
    sentence:
      "After the long transatlantic flight, he felt absolutely ______ and went straight to bed.",
    stem: "EXHAUST",
    answer: "exhausted",
    tip: "EXHAUST → exhausted (-ed passive adjective; the person experienced exhaustion).",
  },
  {
    id: "q3-147",
    type: "t3",
    sentence:
      "The step-by-step guide was perfectly clear and ______ — anyone could assemble it easily.",
    stem: "UNDERSTAND",
    answer: "understandable",
    tip: 'UNDERSTAND → understandable (-able); "anyone could" confirms positive form, no un-.',
  },
  {
    id: "q3-148",
    type: "t3",
    sentence:
      "She has always had a very ______ nature and rarely holds a grudge against anyone.",
    stem: "FORGIVE",
    answer: "forgiving",
    tip: "FORGIVE → forgiving (-ing adjective = readily pardoning others).",
  },

  // Visionary / methodical / influential type
  {
    id: "q3-149",
    type: "t3",
    sentence:
      "The CEO gave a highly ______ speech about the company's future that left the audience inspired.",
    stem: "VISION",
    answer: "visionary",
    tip: "VISION → visionary (-ary adjective = showing great foresight).",
  },
  {
    id: "q3-150",
    type: "t3",
    sentence:
      "The new bridge design was highly ______ and won several international engineering awards.",
    stem: "ORIGIN",
    answer: "original",
    tip: "ORIGIN → original (-al adjective = novel, not copied).",
  },
  {
    id: "q3-151",
    type: "t3",
    sentence:
      "The scientist's ______ approach involved testing every single hypothesis dozens of times before drawing conclusions.",
    stem: "METHOD",
    answer: "methodical",
    tip: "METHOD → methodical (-ical adjective = systematic).",
  },
  {
    id: "q3-152",
    type: "t3",
    sentence:
      "The team published their most ______ paper yet, attracting global media coverage.",
    stem: "INFLUENCE",
    answer: "influential",
    tip: "INFLUENCE → influential (drop -ce, add -tial).",
  },

  // High-frequency / tricky derivations
  {
    id: "q3-153",
    type: "t3",
    sentence:
      "The charity depends entirely on the ______ of local businesses to fund its programmes.",
    stem: "GENEROUS",
    answer: "generosity",
    tip: "GENEROUS → generosity (drop -ous, add -ity; irregular).",
  },
  {
    id: "q3-154",
    type: "t3",
    sentence:
      "The new coach transformed the team's ______, turning them from relegation candidates into champions.",
    stem: "PERFORM",
    answer: "performance",
    tip: "PERFORM → performance (-ance noun).",
  },
  {
    id: "q3-155",
    type: "t3",
    sentence:
      "After years of struggle, her novel finally received the ______ it truly deserved.",
    stem: "RECOGNISE",
    answer: "recognition",
    tip: "RECOGNISE → recognition (drop -ise, add -ition; irregular).",
  },
  {
    id: "q3-156",
    type: "t3",
    sentence:
      "The politician's remarks were widely condemned as deeply ______ and offensive.",
    stem: "TOLERATE",
    answer: "intolerant",
    tip: 'TOLERATE → intolerant (in- + -ant adjective); "condemned" confirms in-.',
  },
  {
    id: "q3-157",
    type: "t3",
    sentence:
      "She remained completely calm throughout the emergency, and her ______ saved several lives.",
    stem: "COMPOSE",
    answer: "composure",
    tip: "COMPOSE → composure (drop -e, add -ure; noun = calmness).",
  },
  {
    id: "q3-158",
    type: "t3",
    sentence:
      "The ______ of the ancient ruins draws thousands of tourists every year.",
    stem: "MAGNIFICENT",
    answer: "magnificence",
    tip: "MAGNIFICENT → magnificence (drop -t, add -ce).",
  },
  {
    id: "q3-159",
    type: "t3",
    sentence:
      "He is renowned for his ______ — he always keeps his word, no matter how difficult things become.",
    stem: "INTEGRATE",
    answer: "integrity",
    tip: "INTEGRATE → integrity (drop -ate, add -ity; = strong moral principles).",
  },
  {
    id: "q3-160",
    type: "t3",
    sentence:
      "The report highlighted a worrying ______ in standards of care across hospitals surveyed.",
    stem: "CONSISTENT",
    answer: "inconsistency",
    tip: 'CONSISTENT → inconsistency (in- + -cy noun); "worrying" confirms in-.',
  },
  {
    id: "q3-161",
    type: "t3",
    sentence:
      "He was the most ______ of all the candidates and had a well-informed answer for every question.",
    stem: "KNOWLEDGE",
    answer: "knowledgeable",
    tip: "KNOWLEDGE → knowledgeable (-able; keep the -e before -able).",
  },
  {
    id: "q3-162",
    type: "t3",
    sentence:
      "She is completely ______ of the pressure her colleagues are under — she never asks how they are.",
    stem: "CONSIDER",
    answer: "inconsiderate",
    tip: 'CONSIDER → inconsiderate (in- + -ate adjective); "never asks" confirms in-.',
  },
  {
    id: "q3-163",
    type: "t3",
    sentence:
      "The council admitted that its handling of the housing crisis had been deeply ______.",
    stem: "SATISFY",
    answer: "unsatisfactory",
    tip: 'SATISFY → unsatisfactory (un- + -ory adjective); "admitted" + "deeply" confirm un-.',
  },
  {
    id: "q3-164",
    type: "t3",
    sentence:
      "The customer complained that the refund policy was completely ______ and demanded to see the manager.",
    stem: "ACCEPT",
    answer: "unacceptable",
    tip: 'ACCEPT → unacceptable (un- + -able); "complained" confirms un-.',
  },
  {
    id: "q3-165",
    type: "t3",
    sentence:
      "Many young people struggle with ______ when they first move away from home and live alone.",
    stem: "HOME",
    answer: "homesickness",
    tip: "HOME → homesickness (compound noun = distress from being away from home).",
  },
  {
    id: "q3-166",
    type: "t3",
    sentence:
      "The festival has been a huge ______ for the region, bringing visitors from across the country.",
    stem: "ATTRACT",
    answer: "attraction",
    tip: "ATTRACT → attraction (-ion noun).",
  },
  {
    id: "q3-167",
    type: "t3",
    sentence:
      "His absolute ______ to the party's core values made him very popular with long-standing members.",
    stem: "DEVOTE",
    answer: "devotion",
    tip: "DEVOTE → devotion (drop -e, add -ion; -ote → -otion).",
  },
  {
    id: "q3-168",
    type: "t3",
    sentence:
      "She made a full ______ from her illness and was back at work within a month.",
    stem: "RECOVER",
    answer: "recovery",
    tip: "RECOVER → recovery (-y noun; drop -er, add -ery).",
  },
  {
    id: "q3-169",
    type: "t3",
    sentence:
      "The committee reached a unanimous ______ that the project should proceed without delay.",
    stem: "AGREE",
    answer: "agreement",
    tip: 'AGREE → agreement (-ment); "unanimous" confirms positive form, no dis-.',
  },
  {
    id: "q3-170",
    type: "t3",
    sentence:
      "The lecture was completely ______ to students with no prior background in the subject.",
    stem: "ACCESS",
    answer: "inaccessible",
    tip: 'ACCESS → inaccessible (in- + -ible); "no prior background" confirms in-.',
  },
  {
    id: "q3-171",
    type: "t3",
    sentence:
      "She showed great ______ when deciding which tasks to prioritise during the most pressured phase.",
    stem: "JUDGE",
    answer: "judgement",
    tip: "JUDGE → judgement (-ment; British spelling with -e).",
  },
  {
    id: "q3-172",
    type: "t3",
    sentence:
      "The architect is known for the ______ of her designs, which often take visitors' breath away.",
    stem: "BOLD",
    answer: "boldness",
    tip: "BOLD → boldness (-ness noun).",
  },
  {
    id: "q3-173",
    type: "t3",
    sentence:
      "The police issued a warning about a ______ individual who had escaped from custody.",
    stem: "DANGER",
    answer: "dangerous",
    tip: "DANGER → dangerous (-ous suffix).",
  },
  {
    id: "q3-174",
    type: "t3",
    sentence:
      "The organisation relies entirely on ______ donations from the public to fund all its work.",
    stem: "VOLUNTEER",
    answer: "voluntary",
    tip: "VOLUNTEER → voluntary (-ary adjective = done willingly without payment).",
  },
  {
    id: "q3-175",
    type: "t3",
    sentence:
      "The new ______ check-in system allows passengers to proceed without speaking to any staff member.",
    stem: "AUTOMATE",
    answer: "automated",
    tip: "AUTOMATE → automated (past participle adjective = operated by machines).",
  },
  {
    id: "q3-176",
    type: "t3",
    sentence:
      "The new law aims to make the planning process far more ______ and faster for applicants.",
    stem: "EFFICIENCY",
    answer: "efficient",
    tip: "EFFICIENCY → efficient (drop -cy, add -t adjective).",
  },
  {
    id: "q3-177",
    type: "t3",
    sentence:
      "The council launched an ______ campaign to reduce the amount of litter in the town centre.",
    stem: "AWARE",
    answer: "awareness",
    tip: 'AWARE → awareness (-ness; "awareness campaign" is a fixed collocation).',
  },
  {
    id: "q3-178",
    type: "t3",
    sentence:
      "She showed ______ leadership during the crisis, serving as a model for everyone around her.",
    stem: "EXAMPLE",
    answer: "exemplary",
    tip: "EXAMPLE → exemplary (-ary adjective = serving as a perfect model).",
  },
  {
    id: "q3-179",
    type: "t3",
    sentence:
      "The new ______ on single-use plastic has been welcomed by environmental groups everywhere.",
    stem: "RESTRICT",
    answer: "restriction",
    tip: "RESTRICT → restriction (-ion noun).",
  },
  {
    id: "q3-180",
    type: "t3",
    sentence:
      "The ______ of the two rival companies created the largest technology firm in the country.",
    stem: "MERGE",
    answer: "merger",
    tip: "MERGE → merger (-er noun = the act or result of merging two organisations).",
  },
  {
    id: "q3-181",
    type: "t3",
    sentence:
      "The article gave a remarkably ______ analysis of the underlying causes of the financial crisis.",
    stem: "PENETRATE",
    answer: "penetrating",
    tip: "PENETRATE → penetrating (-ing adjective = deeply insightful).",
  },
  {
    id: "q3-182",
    type: "t3",
    sentence:
      "She showed great ______ in her early career, and everyone expects her to fulfil it one day.",
    stem: "PROMISE",
    answer: "promise",
    tip: 'PROMISE as a noun: "show great promise" is a fixed collocation (no suffix change).',
  },
  {
    id: "q3-183",
    type: "t3",
    sentence:
      "The café had a wonderfully ______ atmosphere, and customers often stayed talking for hours.",
    stem: "WELCOME",
    answer: "welcoming",
    tip: "WELCOME → welcoming (-ing adjective = friendly and inviting).",
  },
  {
    id: "q3-184",
    type: "t3",
    sentence:
      "The teacher was known for giving ______ feedback — she always found something wrong with everything.",
    stem: "CONSTRUCT",
    answer: "unconstructive",
    tip: 'CONSTRUCT → unconstructive (un- + -ive); "always found something wrong" confirms un-.',
  },
  {
    id: "q3-185",
    type: "t3",
    sentence:
      "She has a ______ talent for languages and currently speaks six of them fluently.",
    stem: "REMARK",
    answer: "remarkable",
    tip: "REMARK → remarkable (-able adjective).",
  },
  {
    id: "q3-186",
    type: "t3",
    sentence:
      "Her ______ during the hostage situation is widely credited with saving the lives of several people.",
    stem: "COMPOSE",
    answer: "composure",
    tip: "COMPOSE → composure (noun = calmness under extreme pressure).",
  },
  {
    id: "q3-187",
    type: "t3",
    sentence:
      "The new sports centre has been a fantastic ______ for the whole town, bringing visitors all year round.",
    stem: "ATTRACT",
    answer: "attraction",
    tip: "ATTRACT → attraction (-ion noun).",
  },
  {
    id: "q3-188",
    type: "t3",
    sentence:
      "She has an ______ passion for cooking and has always dreamed of opening her own restaurant.",
    stem: "BOUND",
    answer: "unbounded",
    tip: 'BOUND → unbounded (un- + past participle = limitless; used positively here to intensify "passion").',
  },
  {
    id: "q3-189",
    type: "t3",
    sentence:
      "The project received full ______ from the board before any work was allowed to begin.",
    stem: "BACK",
    answer: "backing",
    tip: "BACK → backing (-ing noun = financial or moral support).",
  },
  {
    id: "q3-190",
    type: "t3",
    sentence:
      "The findings were completely ______ — every single test confirmed the same extraordinary result.",
    stem: "CONCLUDE",
    answer: "conclusive",
    tip: "CONCLUDE → conclusive (drop -e, add -ive = providing definite proof).",
  },
  {
    id: "q3-191",
    type: "t3",
    sentence:
      "There was a noticeable ______ in her voice when she was asked about the missing files.",
    stem: "HESITATE",
    answer: "hesitation",
    tip: "HESITATE → hesitation (drop -e, add -ion).",
  },
  {
    id: "q3-192",
    type: "t3",
    sentence:
      "The charity provides ______ housing for families who have been made homeless through no fault of their own.",
    stem: "AFFORD",
    answer: "affordable",
    tip: "AFFORD → affordable (-able adjective = at a price people can manage).",
  },
  {
    id: "q3-193",
    type: "t3",
    sentence:
      "She felt a deep sense of ______ when she finally crossed the finish line after years of training.",
    stem: "FULFIL",
    answer: "fulfilment",
    tip: "FULFIL → fulfilment (-ment noun; single l in British English).",
  },
  {
    id: "q3-194",
    type: "t3",
    sentence:
      "The concert was a huge ______ — over fifty thousand people attended on each of the three nights.",
    stem: "SUCCEED",
    answer: "success",
    tip: "SUCCEED → success (drop -eed, add -ess; irregular; must be memorised).",
  },
  {
    id: "q3-195",
    type: "t3",
    sentence:
      "The local council found itself in an extremely ______ position when the scandal broke in the press.",
    stem: "EMBARRASS",
    answer: "embarrassing",
    tip: "EMBARRASS → embarrassing (-ing active adjective; the situation caused embarrassment).",
  },
  {
    id: "q3-196",
    type: "t3",
    sentence:
      "She passed the exam with ______ colours, achieving the highest mark in her entire year group.",
    stem: "FLY",
    answer: "flying",
    tip: 'FLY → flying; fixed expression: "with flying colours" = with great distinction.',
  },
  {
    id: "q3-197",
    type: "t3",
    sentence:
      "The museum has an extensive ______ of items from ancient Egypt on display on the ground floor.",
    stem: "COLLECT",
    answer: "collection",
    tip: "COLLECT → collection (-ion noun).",
  },
  {
    id: "q3-198",
    type: "t3",
    sentence:
      "The company's ______ to cutting costs meant that hundreds of staff received no pay rise for three years.",
    stem: "COMMIT",
    answer: "commitment",
    tip: "COMMIT → commitment (-ment; double t).",
  },
  {
    id: "q3-199",
    type: "t3",
    sentence:
      "She gave a completely ______ performance, and many in the audience were moved to tears.",
    stem: "FORGET",
    answer: "unforgettable",
    tip: 'FORGET → unforgettable (un- + -table; double t; "moved to tears" shows it was intensely memorable, confirming un-).',
  },
  {
    id: "q3-200",
    type: "t3",
    sentence:
      "The ______ of the agreement was celebrated with a formal ceremony attended by both heads of state.",
    stem: "SIGN",
    answer: "signing",
    tip: "SIGN → signing (-ing noun = the act of signing a document).",
  },
];
