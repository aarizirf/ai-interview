import { questions as mergerInstructions } from './merger';
import { questions as lboInstructions } from './lbo';
import { questions as dcfInstructions } from './dcf';
import { questions as valuationInstructions } from './valuation';
import { questions as evInstructions } from './ev';
import { questions as accountingInstructions } from './accounting';

export const questions = `
This is a general interview. Use any of the following questions to conduct the interview. Skip around.
${mergerInstructions}

${lboInstructions}

${dcfInstructions}

${valuationInstructions}

${evInstructions}

${accountingInstructions}
`;
