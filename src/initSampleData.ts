import { addSchool, addArticle } from './services/firebaseService';

// Sample schools data
const sampleSchools = [
  {
    name: 'Abington Heights High School',
    location: 'Clarks Summit, PA',
    logoUrl: ''
  },
  {
    name: 'Delaware Valley High School',
    location: 'Milford, PA',
    logoUrl: ''
  },
  {
    name: 'North Pocono High School',
    location: 'Covington Township, PA',
    logoUrl: ''
  },
  {
    name: 'Scranton High School',
    location: 'Scranton, PA',
    logoUrl: ''
  },
  {
    name: 'Scranton Preparatory School',
    location: 'Scranton, PA',
    logoUrl: ''
  },
  {
    name: 'Valley View High School',
    location: 'Archbald, PA',
    logoUrl: ''
  },
  {
    name: 'Wallenpaupack Area High School',
    location: 'Hawley, PA',
    logoUrl: ''
  },
  {
    name: 'Dunmore High School',
    location: 'Dunmore, PA',
    logoUrl: ''
  },
  {
    name: 'Honesdale High School',
    location: 'Honesdale, PA',
    logoUrl: ''
  },
  {
    name: 'Lakeland High School',
    location: 'Jermyn, PA',
    logoUrl: ''
  }
];

// Sample articles data
const sampleArticles = [
  {
    title: 'Welcome to SPAN SportsHub',
    excerpt: 'The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community with the most accurate stats provided by the teams.',
    content: `The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community with the most accurate stats provided by the teams. We are committed to keeping our services free to allow for everyone to access our content.

On the website, you will be able to find all schools located in the Lackawanna Interscholastic Athletics Association and their respective teams. You will also find links to video and radio broadcasts, so you can watch or listen to your favorite teams on the go.

Our current resources only allow us to cover Girls' Tennis and Football for the Fall 2025 Season. As we look to expand into more sports in the coming season, we will look for more opportunities to grow and expand our brand. Stay tuned in the following weeks and months as we announce more exciting things that have yet to come!`,
    date: 'July 7, 2025',
    category: 'Welcome'
  },
  {
    title: 'Fall 2025 Season Preview',
    excerpt: 'Get ready for an exciting fall season with football and girls tennis coverage across District 2 schools.',
    content: `The Fall 2025 season is just around the corner, and SPAN SportsHub is excited to bring you comprehensive coverage of high school athletics across District 2.

This season, we'll be focusing on:
- Football: All three divisions with live scores, stats, and game recaps
- Girls Tennis: Individual and team results from across the district

Our team of dedicated volunteers will be at games throughout the season, providing real-time updates and comprehensive coverage. Whether you're a player, parent, coach, or fan, SPAN SportsHub is your go-to source for all things District 2 athletics.

Stay tuned for weekly updates, player spotlights, and team rankings as the season progresses!`,
    date: 'July 8, 2025',
    category: 'Season Preview'
  },
  {
    title: 'District 2 Football Divisions Announced',
    excerpt: 'The PIAA has released the official division alignments for the 2025 football season.',
    content: `The Pennsylvania Interscholastic Athletic Association (PIAA) has officially announced the division alignments for the 2025 football season in District 2.

Division 1 (Class 6A):
- Abington Heights Comets
- Delaware Valley Warriors
- North Pocono Trojans
- Scranton Knights
- Scranton Prep Cavaliers
- Valley View Cougars
- Wallenpaupack Buckhorns

Division 2 (Class 4A):
- Dunmore Bucks
- Honesdale Hornets
- Lakeland Chiefs
- Mid Valley Spartans
- West Scranton Invaders
- Western Wayne Wildcats

Division 3 (Class 2A):
- Carbondale Area Chargers
- Holy Cross Crusaders
- Lackawanna Trail Lions
- Old Forge Blue Devils
- Riverside Vikings
- Susquehanna Sabers

The season kicks off on August 29th with several exciting matchups. SPAN SportsHub will provide live coverage of all games throughout the season.`,
    date: 'July 9, 2025',
    category: 'Football'
  }
];

// Function to initialize sample data
export const initializeSampleData = async () => {
  try {
    console.log('Starting to initialize sample data...');
    
    // Add schools
    console.log('Adding sample schools...');
    for (const school of sampleSchools) {
      try {
        await addSchool(school);
        console.log(`Added school: ${school.name}`);
      } catch (error) {
        console.error(`Failed to add school ${school.name}:`, error);
      }
    }
    
    // Add articles
    console.log('Adding sample articles...');
    for (const article of sampleArticles) {
      try {
        await addArticle(article);
        console.log(`Added article: ${article.title}`);
      } catch (error) {
        console.error(`Failed to add article ${article.title}:`, error);
      }
    }
    
    console.log('Sample data initialization complete!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Export the sample data for manual use
export { sampleSchools, sampleArticles }; 