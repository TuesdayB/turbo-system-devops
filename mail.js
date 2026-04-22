// import 'dotenv/config';
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: `${process.env.EMAIL}`, //change to match your gmail! 
//     pass: process.env.EMAIL_PASS
//   }
// });

// export async function sendEmail(emailArray, pageId) {
//   for (const email of emailArray){
//     try {
//       await transporter.sendMail({
//         from: `"Space Station 76" <${process.env.EMAIL}>`,
//         to: email,
//         subject: 'New page posted!',
//         text: 'Read it here: https://spacestation76.barrycumbie.com/comic?page=' + pageId
//       });
//       console.log('Email sent successfully!');
//     } catch (error) {
//       console.error('Error sending email:', error);
//     }
//   }
// }

