export const captchaGenerator = {
  generateChallenge: () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return {
      question: `What is ${a} + ${b}?`,
      answer: (a + b).toString(),
    };
  },
};
