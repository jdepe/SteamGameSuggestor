/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [    "./views/**/*.hbs", 
                "./public/javascripts/**/*.js",],
  theme: {
    extend: {
      maxHeight: {
        '0' :'0',
        'full': '100%',
      },
    },
  },
  plugins: [],
}

