import React, { Component, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import bannerPC from '../../../assets/img/3355banner1_L.png';
import bannerMobile from '../../../assets/img/3355banner1_S.png';
import banner_gift from '../../../assets/img/nw_banner_pc01.png';
import bannerMobileGift from '../../../assets/img/nw_banner01.png';
import tutorialPC from '../../../assets/img/TutoriaBanner_L.png'
import tutorialMobile from '../../../assets/img/TutoriaBanner_S.png';

const Banner = () => {
  const navigate = useNavigate();

    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true,
      autoplay: true,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      centerPadding: '0px',
      adaptiveHeight: true,
    };

      // const items = [
      //     { id: 1, url: `${process.env.PUBLIC_URL}/img/nw_banner01.png` },
      //     { id: 2, url: `${process.env.PUBLIC_URL}/img/nw_banner03.png` },
      //     // { id: 3, url: "http://placeimg.com/1920/540/any"  },
      //   ];

    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    const [isMobile, setIsMobile] = useState();
  
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener('resize', handleResize);
      handleResize();
      if (windowSize.width < 1129) {
        setIsMobile(true);
      } else if (windowSize.width >= 1129) {
        setIsMobile(false);
      }
      return () => window.removeEventListener('resize', handleResize);
    }, [windowSize.width]);

    return (
    // <SliderWrapper>
    //     <StSlider {...settings}>
    //     {items.map(item => {
    //         return (
    //           <div key={item.id}>
    //             <ImageContainer>
    //               <Image src={item.url} />
    //             </ImageContainer>
    //           </div>
    //         );
    //       })}
    //     </StSlider>
    // </SliderWrapper>
     <SliderWrapper>
     <StSlider {...settings}>
           <div >
               <Image src={isMobile ? bannerMobile : bannerPC} alt=""/>
           </div>
           <div 
           onClick={()=>window.location.href = 'https://forms.gle/QhmPUGo9REbZ77Kg6'}>
               <Image style={{cursor:'pointer'}} src={isMobile ? bannerMobileGift : banner_gift} alt=""/>
           </div>
           <div onClick={()=>navigate('/tutorial')}>
               <Image style={{cursor:'pointer'}} src={isMobile ? tutorialMobile : tutorialPC} alt=""/>
           </div>
     </StSlider>
 </SliderWrapper>
    );
  };

  export default Banner;

const SliderWrapper = styled.div`
  width: 1085px;
  height: 333px;
  margin: 0 auto;
  margin-top: 40px;
  overflow: hidden;
  border-radius: 10px;
  @media only screen and (min-width: 768px) and (max-width: 1129px) {
    width: 715px;
    height: 324px;
  }

  @media only screen and (max-width: 767px) {
    width: 345px;
    height: 171px;
  }

  .slick-dots {
    .slick-active {
      button::before {
        color: #b1b1b1;
      }
    }
    button::before {
      color: #cccccc;
    }
  }
`

const StSlider = styled(Slider)`
  .slick-slide {
    width: 30px;
    /* a {
      text-decoration: none;
    } */
  }
  .slick-slide div {
    outline: none;
  }
  .slick-list {
    border-radius: 15px;
  }
`;

const Image = styled.img`
  max-width: 100%;
  object-fit: cover;
`;