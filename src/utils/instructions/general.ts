import { questions as mergerInstructions } from './merger';
import { questions as lboInstructions } from './lbo';
import { questions as dcfInstructions } from './dcf';
import { questions as valuationInstructions } from './valuation';
import { questions as evInstructions } from './ev';
import { questions as accountingInstructions } from './accounting';

export const questions = `
This is a general interview. Use any of the following questions to conduct the interview. Start with 3 behavioral questions, then move on to the other questions.
Behavioral Question #1: Something like "Tell me a little about yourself".
Behavioral Question #2: Something like "Why are you interested in Investment Banking?".
Behavioral Question #3: Generate one that you think is interesting depending on the candidate's background.
${mergerInstructions}

${lboInstructions}

${dcfInstructions}

${valuationInstructions}

${evInstructions}

${accountingInstructions}
`;
