'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker('email', async (job) => {
  if (job.name !== 'otp') {
    throw new Error(`Unsupported email job: ${job.name}`);
  }

  const { to, otp } = job.data;
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@example.com',
    to,
    subject: 'Your verification code',
    text: `Your verification code is ${otp}.`,
  });
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

module.exports = { worker };
