import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { __getMyInfo } from '../../../redux/modules/myinfo';
import imageCompression from 'browser-image-compression';

const API_URL = process.env.REACT_APP_HOST_PORT;
const ACCESSTOKEN = localStorage.getItem('ACCESSTOKEN');
const REFRESHTOKEN = localStorage.getItem('REFRESHTOKEN');

const InfoEdit = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const myinfo = useSelector((state)=>state.myinfo.myinfo);
  // console.log(myinfo);
  
  const [imgFile, setImgFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(myinfo.imgUrl);
    const [nickname, setNickname] = useState(myinfo.nickname);
  const [isNickEditMode, setIsNickEditMode] = useState(false);

  const imgFileInputRef = useRef();
  const imgFileUploadBtnRef = useRef();
  const removeinfoBtnRef = useRef();

  useEffect(()=>{
      dispatch(__getMyInfo())
    },[])


    const resetAllStates = () => {
        setNickname('');
        setPreviewImg('');
        setImgFile(null);
      };

      //중복확인
      const [nickCheckRes, setNickCheckRes] = useState("");


      const nicknameCheckHandler = async () => {
        if (nickname.trim() === "") {
          return alert("닉네임을 입력해주세요.");
        }
        try {
          const response = await axios.post(`${API_URL}/member/nickname`, {
            nickCheck: nickname,
          });

          if (response.data.success === true) {
            alert(response.data.data);
            setNickCheckRes(response.data.success);
            return;
          }
          if (response.data.success === false) {
            alert(response.data.error.message);
            setNickCheckRes(response.data.success);
            return;
          }
        } catch (error) {
          // console.log(error);
          alert('요청에 실패했습니다.\n다시 시도 부탁드립니다.')
        }
      };


    const onEditHandler = async (e) => {
      e.preventDefault();
      if (nickname.trim() === "") {
        return alert("닉네임을 입력하세요.");
      }
      if (nickCheckRes === false) {
        alert(
          "이미 존재하는 닉네임입니다.\n새로운 닉네임을 입력 후 중복검사 바랍니다."
        );
        return setNickCheckRes("");
      }
      if (window.confirm("수정 사항을 저장하시겠습니까?")) {
        const formData = new FormData();
        formData.append("nickname", nickname);
        if (imgFile !== null) {
          formData.append("imgFile", imgFile);
        }

        try {
          const response = await axios.put(`${API_URL}/member`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: localStorage.getItem('ACCESSTOKEN'),
              RefreshToken: localStorage.getItem('REFRESHTOKEN'),
            },
          });

          if (response.data.success === true) {
            alert(response.data.data);
            // console.log(response)
            resetAllStates();
            localStorage.setItem("ACCESSTOKEN", response.headers.authorization);
            localStorage.setItem("REFRESHTOKEN", response.headers.refreshtoken);
            localStorage.setItem("ImgURL", response.headers.imgurl);
            return navigate("/mypage");
          }
          if (response.data.success === false) {
            alert(response.data.error.message);
            return;
          }
        } catch (error) {
          // console.log(error);
          alert('요청에 실패했습니다.\n다시 시도 부탁드립니다.')
        }
      }
    };;

    const onChangeImgFileInput = async (e) => {
      let file = e.target.files[0];	// 입력받은 file객체
      const options = { 
        maxSizeMB: 1, 
        maxWidthOrHeight: 300
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

    const onChangeRemoveInfo = async (e) => { 
        e.preventDefault();
        if (window.confirm("정말로 삼삼오오를 탈퇴하시겠습니까?")) {
          try {
            const deletedata = await axios.put(`${API_URL}/member/signout`, {data: '탈퇴요청' } , {
              headers: {
                "Authorization": ACCESSTOKEN,
                "RefreshToken": REFRESHTOKEN,
              }
            });
            // console.log(deletedata)
            
            if (deletedata.data.success === true) {
              localStorage.removeItem("ACCESSTOKEN");
              localStorage.removeItem("REFRESHTOKEN");
              localStorage.removeItem("ImgURL");
              localStorage.removeItem("Role");
              localStorage.removeItem("Id");
              resetAllStates();
              alert('회원 탈퇴가 완료되었습니다.')
              return navigate('/');
            };
            if (deletedata.data.success === false) {
              alert(deletedata.data.error.message);
              return
            };
          } catch (error) {
            // console.log(error);
            alert('요청에 실패했습니다.\n다시 시도 부탁드립니다.')
          }
        }
      };

    return (
      <>
        <Item2Form onSubmit={onEditHandler}>
          <StDiv style={{ justifyContent: "flex-start" }}>
            <img
              alt="뒤로가기"
              src={process.env.PUBLIC_URL + "/img/backspace.png"}
              style={{ width: "25px", height: "25px", marginRight: "10px" }}
              onClick={() => navigate(-1)}
            />
            <h3>계정 정보 수정</h3>
          </StDiv>
          <ContainerWrapper>
            <EditContainer>
              <Imgwrapper>
                <StImg
                  src={previewImg ? previewImg : myinfo.imgUrl}
                  alt="profileImg"
                />
              </Imgwrapper>
              <Contentwrapper>
                <MyInfo>
                  <StId>{myinfo.userId}</StId>
                  <StId>{myinfo.nickname}</StId>
                </MyInfo>

                <EditNickBtn
                  type="button"
                  onClick={() => {setIsNickEditMode(true);}}>
                  닉네임 변경
                </EditNickBtn>
                {isNickEditMode? (
                  <Div>
                  <StNickname>
                    <span style={{ marginRight: "10px" }}>닉네임</span>
                    <StInput
                      required
                      name="nickname"
                      maxLength={10}
                      placeholder="최대 10자"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </StNickname>
                  <div>
                    <OverlapButton type="button" onClick={nicknameCheckHandler}>
                      중복확인
                    </OverlapButton>
                    <OverlapButton 
                    style={{backgroundColor:"#d12626"}}
                    type="button" 
                    onClick={() => {
                      setIsNickEditMode(false);
                      setNickCheckRes("");
                      setNickname(myinfo.nickname);
                      }}>
                      변경 취소
                    </OverlapButton>
                  </div>
                </Div>
                ):(false)}

                <StInput
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  name="imgFile"
                  onChange={onChangeImgFileInput}
                  ref={imgFileInputRef}
                />
                <BtnEdit
                  style={{ backgroundColor: "#1E88E5" }}
                  type="button"
                  ref={imgFileUploadBtnRef}
                  onClick={() => {
                    imgFileInputRef.current.click();
                  }}
                >
                  프로필 사진 변경
                </BtnEdit>
                {/* <BtnEdit>비밀번호 변경</BtnEdit> */}
                <BtnEdit
                  type="button"
                  onClick={onChangeRemoveInfo}
                  ref={removeinfoBtnRef}
                >
                  회원 탈퇴
                </BtnEdit>
              </Contentwrapper>
            </EditContainer>
            <StButton
              type="submit"
              style={{
                width: "200px",
                backgroundColor: "#038E00",
                marginTop: "60px",
              }}
            >
              수정 완료
            </StButton>
          </ContainerWrapper>
        </Item2Form>
      </>
    );
};

export default InfoEdit;

const StDiv = styled.div`
  display: flex;
  width: 80vw;
  min-width: 320px;
  max-width: 640px;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  margin-top: 15px;
  margin-bottom: 10px;
`;

const Item2Form = styled.form`
  /* background-color: yellow; */
  grid-area: b;
  min-width: 375px;
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
`;

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
`;

const EditContainer = styled.div`
  display: flex;
  width: 80vw;
  min-width: 340px;
  max-width: 640px;
  justify-content: center;
  /* align-items: center; */
`;

const Imgwrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30vw;
  margin: 0 auto;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const StInput = styled.input`
  box-sizing: border-box;
    width: 100px;
    height: 30px;
    border: transparent;
    border-bottom: 1.5px solid grey;
    padding-left: 15px;
    :focus {
      outline: none;
      border-color: #18a0fb;
      box-shadow: 0 1 3px #18a0fb;
    }
`;

const StImg = styled.img`
    width: 85px;
    height: 85px;
    border-radius: 100%;
    border: 0.5px solid #ededed;
    object-fit: cover;
`;

const BtnEdit = styled.div`
  color: #1565C0 !important;
  border: 0px solid #2196F3;
  background-color: white !important;
  border-radius: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  cursor: pointer;
`;

const EditNickBtn = styled.div`
  color: #1565C0 !important;
  border: 0px solid #2196F3;
  background-color: white !important;
  border-radius: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  cursor: pointer;
`;

const Contentwrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 80vw;
  margin: 0 auto;
  margin-top: 25px;
  margin-bottom: 10px;
  margin-left: 10px;
  /* background-color: beige; */
`;

const MyInfo = styled.div`
height: 60px;
display: flex;
flex-direction: column;
justify-content: center;
`

const StId = styled.div`
display: flex;
width: 100%;
font-size: 15px;
font-weight: 600;
font-family: 'NotoSansKR';
/* margin-top: 20px;
padding-top: 20px;
border-top: 1px solid #c9c9c9; */
`;

const StNickname = styled.div`
display: flex;
/* width: 100%; */
align-items: center;
font-size: 14px;
font-family: 'NotoSansKR';
margin-top: 20px;
/* margin-bottom: 40px; */
/* border: 1px solid black; */
`;

const StButton = styled.button`
  min-width: 110px;
  min-height: 32px;
  color: white;
  border: transparent;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 13px;
  cursor: pointer;
  :hover {
            filter: brightness(90%);
            box-shadow: 1px 1px 3px 0 #bcd7ff;
  }
`;

const OverlapButton = styled.button`
  height: 30px;
  width: 80px;
  padding: 0 10px;
  margin-top: 20px;
  margin-left: 10px;
  border: transparent;
  border-radius: 5px;
  outline: none;
  color: white;
  background-color: grey;
  cursor: pointer;
  :hover {
    filter: brightness(95%);
  }
`;  

const Div = styled.div`
  display: flex;
  flex-direction: column;
`