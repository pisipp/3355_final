import React, { useRef, useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { DatePicker, RangeDatePicker } from '@y0c/react-datepicker';
import '@y0c/react-datepicker/assets/styles/calendar.scss';
import 'moment/locale/ko';
import MapOfEdit from './MapOfEdit';
import imageCompression from 'browser-image-compression';

import { __detail } from '../../../redux/modules/detail';

const API_URL = process.env.REACT_APP_HOST_PORT; 

const DetailEdit = () => {
  const navigate = useNavigate();
  const params_id = useParams().id;
  const dispatch = useDispatch();

  const { detail } = useSelector((state)=> state.detail);
  // console.log(detail);
  //   address 주소
//   authorNickname 게시글 작성자 닉네임
//   authorId 게시글 작성자 아이디
//   commentList: [] 게시글 댓글 리스트
//   content 게시글 내용
//   dday 모임 일자
//   endDate 마감 일자
//   id 게시글 id
//   maxNum 모집인원
//   memberImgUrl 작성자 프사
//   postImgUrl 게시글 썸네일
//   restDay 남은 모집 기간
//   startDate 공고일
//   title 게시글 제목
//   currentNum 현재 모집된 인원

  useEffect(()=>{
    dispatch(__detail(params_id))
  },[])

  const [category, setCategory] = useState(detail.category);
  const [title, setTitle] = useState(detail.title);
  const [content, setContent] = useState(detail.content);
  const [maxNum, setMaxNum] = useState(detail.maxNum); 
  const [startDate, setStartDate] = useState(detail.startDate);
  const [endDate, setEndDate] = useState(detail.endDate);
  const [dDay, setDday] = useState(detail.dday);
  const [imgFile, setImgFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(detail.postImgUrl);
  const imgFileInputRef = useRef();
  const imgFileUploadBtnRef = useRef();

  const [address, setAddress] = useState(detail.address);
  const [detailAddress, setDetailAddress] = useState(detail.detailAddress);
  const [placeName, setPlaceName] = useState(detail.placeName);
  const [placeUrl, setPlaceUrl] = useState(detail.placeUrl);
  const [placeX, setPlaceX] = useState(detail.placeX);
  const [placeY, setPlaceY] = useState(detail.placeY);

  const [inputText, setInputText] = useState("");
  const [place, setPlace] = useState(" ");

  const handleSubmit = (e) => {
    e.preventDefault();
    setPlace(inputText);
  };

  const CategoryBeforeEdit = () => {
    if (detail.category === 'EXERCISE') {
      return '운동'
    }
    if (detail.category === 'TRAVEL') {
      return '여행'
    }
    if (detail.category === 'READING') {
      return '독서'
    }
    if (detail.category === 'STUDY') {
      return '공부'
    }
    if (detail.category === 'RELIGION') {
      return '종교'
    }
    if (detail.category === 'ONLINE') {
      return '온라인'
    }
    if (detail.category === 'ETC') {
      return '기타'
    }
  };

  const resetAllStates = () => {
    setCategory('');
    setTitle('');
    setContent('');
    setMaxNum('');
    setStartDate('');
    setEndDate('');
    setDday('');
    setPreviewImg('');
    setImgFile(null);
    setAddress('');
    setDetailAddress('');
    setPlaceName('');
    setPlaceUrl('');
    setPlaceX('');
    setPlaceY('');
    setInputText("");
    setPlace(" ");
  };

  const onChangeImgFileInput = async (e) => {
    let file = e.target.files[0];	// 입력받은 file객체
    const options = { 
      maxSizeMB: 1, 
      maxWidthOrHeight: 600
    }
    try {
      const compressedFile = await imageCompression(file, options);
      setImgFile(compressedFile);
      
      // resize된 이미지의 url을 받아 fileUrl에 저장
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
      promise.then(result => {
        setPreviewImg(result);
      })
    } catch (error) {
      console.log(error);
    }
    // setImgFile(e.target.files[0]);
    // setPreviewImg(URL.createObjectURL(e.target.files[0]));
  };

  const onEditHandler = async (e) => {
    e.preventDefault();
    if (title.trim() === '' ||
        address.trim() === '' ||
        content.trim() === '' ||
        category.trim() === '' ||
        maxNum === '' ||
        startDate === null||
        endDate === null ||
        dDay === null
    ) {
      return alert('모든항목을 입력해야 수정 가능합니다.')
    }
    if (window.confirm('수정사항을 저장하시겠습니까?')) {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('maxNum', Number(maxNum));
      formData.append('startDate', startDate ===  detail.startDate ? detail.startDate : new Date(+startDate + 3240 * 10000).toISOString().split("T")[0] );
      formData.append('endDate', endDate === detail.endDate ? detail.endDate : new Date(+endDate + 3240 * 10000).toISOString().split("T")[0] );
      formData.append('dDay', dDay === detail.dday ? detail.dday : new Date(+dDay + 3240 * 10000).toISOString().split("T")[0] );
      formData.append('address', address);
      formData.append('detailAddress', detailAddress);
      formData.append('placeName', placeName);
      formData.append('placeUrl', placeUrl);
      formData.append('placeX', placeX);
      formData.append('placeY', placeY);
      if (imgFile!==null) {
        formData.append('ImgFile', imgFile);
      }
  
      try {
        const ACCESSTOKEN = localStorage.getItem('ACCESSTOKEN');
        const REFRESHTOKEN = localStorage.getItem('REFRESHTOKEN');
        const response = await axios.put(`${API_URL}/post/${detail.id}`, formData, {
          headers: {
            "Content-Type":"multipart/form-data",
            "Authorization":ACCESSTOKEN,
            "RefreshToken":REFRESHTOKEN,
          }
        });
            
        if (response.data.success === true) {
            alert(response.data.data);
            resetAllStates();
            return navigate(`/detail/${detail.id}`);
        };
        if (response.data.success === false) {
            alert(response.data.error.message);
            return
        };
    } catch (error) {
        console.log(error);
    }
    }
    // navigate('/');
    // resetAllStates();
  };


  return (
    <StContainer>
    <Item2>
      <StDiv>
        <BackSpaceImg
          alt='뒤로가기'
          src={`${process.env.PUBLIC_URL}/img/backspace.png`}
          onClick={() => {
            navigate(-1);
            resetAllStates();
          }}
        />
        <h3>게시글 수정하기</h3>
      </StDiv>
      <StDiv style={{ flexDirection: 'column', alignItems:'normal' }}>
        <StImg
          src={previewImg? previewImg : detail.postImgUrl }
          alt='썸네일 사진을 재등록해주세요.'
          onClick={() => {
            imgFileUploadBtnRef.current.click();
          }}
        />
        <StInput
          type='file'
          style={{ display: 'none' }}
          accept='image/*'
          name='imgFile'
          onChange={onChangeImgFileInput}
          ref={imgFileInputRef}
        />
        <StButton
          style={{ backgroundColor: '#1E88E5' }}
          type='button'
          ref={imgFileUploadBtnRef}
          onClick={() => {
            imgFileInputRef.current.click();
          }}
        >
          썸네일 사진 재등록
        </StButton>
      </StDiv>
      <CategoryDiv>
        <CategorySelect
          name="category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>현재 모임 분류: <CategoryBeforeEdit/></option>
          <option value="EXERCISE">운동</option>
          <option value="TRAVEL">여행</option>
          <option value="READING">독서</option>
          <option value="STUDY">공부</option>
          <option value="RELIGION">종교</option>
          <option value="ONLINE">온라인</option>
          <option value="ETC">기타</option>
        </CategorySelect>
      </CategoryDiv>
      <StDiv>
        <StInput
          required
          name='title'
          maxLength={50}
          placeholder='제목 (50자 이내)'
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </StDiv>
      <StDiv>
        <StTextarea
        cols='27'
        rows='10'
          value={content}
          required
          name='content'
          placeholder='내용 (250자 이내)'
          maxLength={250}
          onChange={(e) => setContent(e.target.value)}
        />
      </StDiv>
      <MaxNumDiv>
      <div style={{fontWeight:'bold'}}>모집 인원</div>
      <div style={{fontSize:'13px', color:'grey', marginBottom:'5px'}}>나를 제외한 팀원의 수를 정해주세요.</div>
        <MaxNumInput
          required
          name='maxNum'
          type='text'
          placeholder='최대 5명'
          value={maxNum}
          maxLength={1}
          onChange={(e) =>
            setMaxNum(
              e.target.value.replace(/[^0-9.]/g, '').replace(/(\.*)\./g, '$1')
            )
          }
        />
        <span style={{marginLeft:'10px'}}>명</span>
      </MaxNumDiv>
      <DatePickerDiv>
        <div style={{fontWeight:'bold'}}>모집 기간</div>
        <div style={{fontSize:'13px', color:'grey', marginBottom:'5px'}}>기간 설정은 오늘부터 가능합니다.</div>
        <div style={{marginTop:'10px'}}>
        <RangeDatePicker
            startText='Start'
            endText='End'
            startPlaceholder={startDate}
            endPlaceholder={endDate}
            // locale='ko'
            clear
            // portal
            onChange={(start, end)=>{
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>
      </DatePickerDiv>
      <DatePickerDiv>
        <div style={{fontWeight:'bold'}}>모임 날짜</div>
        <div style={{fontSize:'13px', color:'grey', marginBottom:'5px'}}>모집 종료일 이후로 선택해주세요.</div>
        <div style={{marginTop:'10px'}}>
          <DatePicker
            placeholder={dDay}
            onChange={(date) => setDday(date.$d)}
            locale="ko"
            showDefaultIcon
            clear
          />
        </div>
      </DatePickerDiv>
      <hr style={{width:'100%', marginTop:'15px'}}/>
        <div style={{fontWeight:'bold'}}>모임 장소</div>
      <AddressDiv>
        <form className="inputForm" onSubmit={handleSubmit}>
          <input
          placeholder='주소 찾기 (키워드, 도로명 주소, 지번 주소 입력 가능)'
          onChange={(e)=>setInputText(e.target.value)}
          value={inputText}
          />
          <button type="submit">검색</button>
          <div style={{fontWeight:'bold', color:'grey', marginBottom:'10px'}}>※ 검색 후 지도의 핀을 눌러 주소를 선택해주세요.</div>
        </form>
        <MapOfEdit 
        searchPlace={place} 
        setAddress={setAddress}
        setPlaceName={setPlaceName}
        setPlaceUrl={setPlaceUrl}
        setPlaceX={setPlaceX}
        setPlaceY={setPlaceY}
        placeX={placeX}
        placeY={placeY}
        />
        <div style={{marginTop:'10px',color:'#18a0fb'}}><strong>{placeName}</strong></div>
        <div style={{margin:'10px 0',color:'#18a0fb'}}>{address} {detailAddress}</div>
      </AddressDiv>
          <DetailAddressInput
            name='detailAddress'
            maxLength={30}
            placeholder='(선택) 상세 주소를 입력해주세요.'
            type='text'
            value={detailAddress || ''}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
      <StButton type='button' style={{ backgroundColor: '#038E00' }}
      onClick={onEditHandler}>
        수정하기
      </StButton>
    </Item2>
    </StContainer>
  );
};

export default DetailEdit;

const StContainer = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 0 auto;
  grid-template-areas:
    'a b b b c';
`;

const Item2 = styled.div`
  /* background-color: yellow; */
  grid-area: b;
  min-width: 375px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
`;

const BackSpaceImg = styled.img`
  width: 25px;
  height: 25px;
  margin-right: 10px;
  border: transparent;
  cursor: pointer;
  :hover {
            filter: brightness(90%);
            box-shadow: 2px 2px 10px 0 #bcd7ff;
  }
`;

const StInput = styled.input`
    box-sizing: border-box;
    min-width: 100%;
    min-height: 40px;
    border: transparent;
    border-bottom: 1px solid grey;
    margin-top: 10px;
    padding-left: 10px;
    :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 0 5px #18a0fb;
    }
`

const MaxNumInput = styled.input`
    box-sizing: border-box;
    width: 80px;
    min-height: 40px;
    border: transparent;
    border: 1px solid #ddd;
    font-size: 15px;
    margin-top: 10px;
    padding-left: 10px;
    :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 0 5px #18a0fb;
    }
`

const StTextarea = styled.textarea` 
font-family:'Noto Sans KR', sans-serif;
   width: 100%; 
   height: 200px;
   margin-top: 10px;
   padding-left: 10px;
   border: transparent;
   border-bottom: 1px solid grey;
   resize: none;
   :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 0 5px #18a0fb;
    }
`;

const StImg = styled.img`
min-width: 300px;
max-width: 410px;
/* min-height: 200px; */
`;

const StDiv = styled.div`
  min-width: 100%;
  max-width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: center;
`;

const CategoryDiv = styled.div`
display: inline-block;
flex-direction: column;
margin-top: 10px;
`;

const CategorySelect = styled.select`
  height: 40px;
  width: 100%;
  border: none;
  outline: none;
  border-bottom: 1px solid grey;
`;

const MaxNumDiv = styled.div`
display: inline-block;
flex-direction: column;
padding-left: 10px;
margin-top: 10px;
`;

const DatePickerDiv = styled.div`
display: flex;
flex-direction: column;
padding-left: 10px;
margin-top: 10px;
`;

const AddressDiv = styled.div`
display: flex;
flex-direction: column;
margin-top: 10px;
div {
  padding-left: 10px;
}
input {
  box-sizing: border-box;
  border: 1px solid #ddd;
  min-height: 40px;
  padding-left: 10px;
  margin-bottom:10px;
  width:87%;
  height:35px;
  @media only screen and (max-width: 720px) {
  width: 84%;
  }
  :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 0 3px #18a0fb;
    }
}
button {
  background-color: #18a0fb;
  margin-left: 10px;
  height: 40px;
  color: white;
  border: transparent;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  @media only screen and (max-width: 720px) {
  font-size: 12px;
  width: fit-content;
  }
  :hover {
            filter: brightness(90%);
            box-shadow: 1px 1px 3px 0 #bcd7ff;
  }
}
`;

const DetailAddressInput = styled.input`
    box-sizing: border-box;
    min-width: 100%;
    min-height: 40px;
    /* border: transparent; */
    border: 1px solid #ddd;
    padding-left: 10px;
    :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 0 3px #18a0fb;
    }
`;

const StButton = styled.button`
  min-width: 300px;
  min-height: 45px;
  color: white;
  border: transparent;
  border-radius: 6px;
  margin-top: 20px;
  font-size: 15px;
  cursor: pointer;
  :hover {
            filter: brightness(90%);
            box-shadow: 1px 1px 3px 0 #bcd7ff;
  }
`;
