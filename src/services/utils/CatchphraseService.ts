class CatchphraseService {
  private static instance: CatchphraseService;
  
  private readonly catchphrases = [
    "Who ya gonna call?",
    "Ring ring! Who's it gonna be?",
    "Time to reach out and touch someone",
    "Ready to make some noise?",
    "Dial it up!",
    "Let's get connected",
    "Who's on your mind?",
    "Ready to chat?",
    "Buzz someone special",
    "Drop them a line!",
    "Ring me maybe?",
    "Can you hear me now?",
    "You've got the right number!",
    "Don't hang up on me!",
    "Let's stay connected",
    "I'm all ears",
    "Calling it in",
    "On the line",
    "Pick up what I'm putting down",
    "Dial it up a notch",
    "Crystal clear communication",
    "Let's touch base",
    "Give me a buzz",
    "Phone home",
    "Making connections",
    "Could this connection BE any clearer?",
    "How YOU doin'?",
    "Hello? Is it me you're looking for?",
    "Operator? Get me the president!",
    "Can't you see I'm on the phone!?"
  ];

  private constructor() {}

  static getInstance(): CatchphraseService {
    if (!CatchphraseService.instance) {
      CatchphraseService.instance = new CatchphraseService();
    }
    return CatchphraseService.instance;
  }

  getRandomCatchphrase(): string {
    const randomIndex = Math.floor(Math.random() * this.catchphrases.length);
    return this.catchphrases[randomIndex] || "Who ya gonna call?";
  }

  getDefaultCatchphrase(): string {
    return "Who ya gonna call?";
  }
}

export default CatchphraseService.getInstance();