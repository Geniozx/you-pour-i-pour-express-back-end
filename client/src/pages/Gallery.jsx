import weddingBar from "../assets/Signature Drinks Wedding Bar.png";
import birthdayBar from "../assets/Festive Birthday Cocktail Bar.png";
import companyBar from "../assets/Upscale Cocktail Company Event.png";



function Gallery() {
  const galleryItems = [
    {
      id: 1,
      title: "Wedding Bar Setup",
      description: "Elegant mobile bar setup for a wedding reception.",
      image: weddingBar
    },
    {
      id: 2,
      title: "Birthday Celebration",
      description: "Custom bar service for a private birthday party.",
      image: birthdayBar
    },
    {
      id: 3,
      title: "Corporate Event",
      description: "Professional bartending service for a company event.",
      image: companyBar
    }
  ];


  return (
    <div>
      <h2>Gallery</h2>

      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div className="gallery-card" key={item.id}>
            <h3>{item.title}</h3>
            <img src={item.image} alt={item.title} />
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery;