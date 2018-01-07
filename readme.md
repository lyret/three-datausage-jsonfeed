
# Three datausage jsonfeed

This script creates a jsonfeed server that every morning updates with an entry on your current data usage.

## Usage

 - download/clone this repository
 - run `yarn`
 - create a `settings.json` file containing the following:

 ```
{
    "username": "", // Tre.se username
    "password": "", // Tre.se password
    "port": 3000, // Port to run the JSONfeed server on
    "debug": true/false // Set to true to run once and show the parsing process in a window */
}
```

 - run `node index.js` or add the script to a process manager like PM2

 ## Licence

[WTFPL – Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/)