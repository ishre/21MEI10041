export const userImages: string[] = [
    'https://via.placeholder.com/150/FF0000/FFFFFF?text=User1',
    'https://via.placeholder.com/150/00FF00/FFFFFF?text=User2',
    'https://via.placeholder.com/150/0000FF/FFFFFF?text=User3',
  ];
  
  export const postImages: string[] = [
    'https://via.placeholder.com/300/FF0000/FFFFFF?text=Post1',
    'https://via.placeholder.com/300/00FF00/FFFFFF?text=Post2',
    'https://via.placeholder.com/300/0000FF/FFFFFF?text=Post3',
  ];
  
  export function getRandomUserImage(): string {
    const index = Math.floor(Math.random() * userImages.length);
    return userImages[index];
  }
  
  export function getRandomPostImage(): string {
    const index = Math.floor(Math.random() * postImages.length);
    return postImages[index];
  }
  