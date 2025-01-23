1. For Inter font family

@import url("https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

2.  For Gradient background

    HTML :
       <div class="mainDiv">
         <div class="radial-gradient"></div>
         </div>

    CSS :

    .mainDiv {

    position: absolute;
    inset: 0;
    z-index: -10;
    height: 100%;
    width: 100%;
    background-color: white;
    background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
    background-size: 6rem 4rem;

    font-family: "Inter", serif;
    }

    .radial-gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: radial-gradient(
    circle 800px at 100% 200px,
    #d5c5ff,
    transparent
    );
    }


