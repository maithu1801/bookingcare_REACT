import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from "../../../utils";
import * as action from "../../../store/actions";
import './UserRedux.scss';
import 'react-image-lightbox/style.css';
import ModalUser from '../ModalUser';
import ModalEditUser from "../ModalEditUser";
import { getAllUsers } from '../../../services/userService';
import TableManageUser from "./TableManageUser";

class UserRedux extends Component {

    constructor(props) {
        super(props);
        this.state = {
            usersRedux: [],
            genderArr: [],
            positionArr: [],
            roleArr: [],
            previewImgURL: '',
            isOpen: false,

            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phonenumber: '',
            address: '',
            position: '',
            role: '',
            avatar: '',
            action: '',
            userEditId: '',
        }
    }
    async componentDidMount() {
        this.props.getGenderStart();
        this.props.getPositionStart();
        this.props.getRoleStart();
        this.props.fetchUserRedux();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.genderRedux !== this.props.genderRedux) {
            let arrGenders = this.props.genderRedux;
            this.setState({
                genderArr: arrGenders,
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : ''
            })
        }

        if (prevProps.roleRedux !== this.props.roleRedux) {
            let arrRoles = this.props.roleRedux;
            this.setState({
                roleArr: arrRoles,
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : ''
            })
        }
        if (prevProps.positionRedux !== this.props.positionRedux) {
            let arrPositions = this.props.positionRedux;
            this.setState({
                positionArr: arrPositions,
                position: arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : ''
            })
        }

        if (prevProps.listUsers !== this.props.listUsers) {
            let arrGenders = this.props.genderRedux;
            let arrRoles = this.props.roleRedux;
            let arrPositions = this.props.positionRedux;

            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phonenumber: '',
                address: '',
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : '',
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : '',
                position: arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : '',
                avatar: '',
                action: CRUD_ACTIONS.CREATE,
                previewImgURL: '',
                usersRedux: this.props.listUsers
            })
        }
    }
    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            let objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                avatar: base64
            })
        }
    }
    openPreviewImage = () => {
        if (!this.state.previewImgURL) return;
        this.setState({
            isOpen: true
        })
    }
    handleSaveUser = () => {
        let isValid = this.checkValidateInput();
        if (isValid === false) return;

        let { action } = this.state;
        if (action === CRUD_ACTIONS.CREATE) {
            //fire redux action
            this.props.createNewUser({
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phonenumber: this.state.phonenumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            })
        }
        if (action === CRUD_ACTIONS.EDIT) {
            //fire redux action
            this.props.editUserRedux({
                id: this.state.userEditId,
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phonenumber: this.state.phonenumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            })
        }
    }
    checkValidateInput = () => {
        let isValid = true;
        let arrCheck = ['email', 'password', 'firstName', 'lastName',
            'phonenumber', 'address']
        for (let i = 0; i < arrCheck.length; i++) {
            if (!this.state[arrCheck[i]]) {
                isValid = false;
                alert('this input is required: ' + arrCheck[i])
                break;
            }
        }
        return isValid;
    }
    onChangeInput = (event, id) => {
        let copyState = { ...this.state }
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        })
    }

    handleEditUserFromParent = (user) => {
        let imageBase64 = '';
        if (user.image) {
            imageBase64 = new Buffer(user.image, 'base64').toString('binary');
        }
        this.setState({
            email: user.email,
            password: 'HARDCODE',
            firstName: user.firstName,
            lastName: user.lastName,
            phonenumber: user.phonenumber,
            address: user.address,
            gender: user.gender,
            role: user.roleId,
            position: user.positionId,
            avatar: '',
            previewImgURL: imageBase64,
            action: CRUD_ACTIONS.EDIT,
            userEditId: user.id
        })
    }
    toggleUserModal = () => {
        this.setState({
            isOpenModalUser: !this.state.isOpenModalUser,
        })
    }
    toggleUserEditModal = () => {
        this.setState({
            isOpenModalEditUser: !this.state.isOpenModalEditUser,
        })
    }
    handleAddNewUser = () => {
        this.setState({
            isOpenModalUser: true
        })
    }
    handleEditUser = (user) => {
        console.log('check manage', user);
        this.setState({
            isOpenModalEditUser: true,
            userEdit: user
        })
    }

    render() {
        let arrUsers = this.props.listUsers;
        console.log('arrUsers', arrUsers);
        return (
            <div className='user-redux-container'>
                <ModalUser
                    isOpen={this.state.isOpenModalUser}
                    toggleFromPrarent={this.toggleUserModal}
                    createNewUser={this.createNewUser}
                />
                {
                    this.state.isOpenModalEditUser &&
                    <ModalEditUser
                        isOpen={this.state.isOpenModalEditUser}
                        toggleFromPrarent={this.toggleUserEditModal}
                        currentUser={this.state.userEdit}
                        editUser={this.doEditUser}
                    />
                }
                <div className='title'>
                    <FormattedMessage id="manage-user.manage" />
                </div>
                <div className="mx-1">
                    <button className="btn btn-primary px-3"
                        onClick={() => this.handleAddNewUser()}
                    ><i className="fas fa-plus"></i> <FormattedMessage id="manage-user.add-new-user" /></button>
                </div>
                <div className='user-redux-body'>
                    <table id="TableManageUser">
                        <tbody>
                            <tr>
                                <th>Ảnh đại diện</th>
                                <th>Email</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                            {arrUsers && arrUsers.length > 0 &&
                                arrUsers.map((item, index) => {
                                    let imageBase64 = '';
                                    if (item.image) {
                                        imageBase64 = new Buffer(item.image, 'base64').toString('binary');

                                    }
                                    return (
                                        <tr key={index} >
                                            <td style={{ textAlign: 'center' }}>
                                                <img className='img-avt' src={imageBase64} /></td>
                                            <td>{item.email}</td>
                                            <td>{item.firstName}</td>
                                            <td>{item.lastName}</td>
                                            <td>{item.address}</td>
                                            <td>
                                                <button
                                                    onClick={() => this.handleEditUser(item)}
                                                    className='btn-edit'><i className='fas fa-pencil-alt'></i></button>
                                                <button
                                                    onClick={() => this.handleDeleteUser(item)}
                                                    className="btn-delete"><i className='fas fa-trash'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    {/* <TableManageUser
                    // handleEditUserFromParent={this.handleEditUserFromParent}
                    // action={this.state.action}
                    /> */}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        genderRedux: state.admin.genders,
        roleRedux: state.admin.roles,
        positionRedux: state.admin.positions,
        isLoadingGender: state.admin.isLoadingGender,
        // users là lưu thông tin của thằng đang đfăng nhập mà, là
        // anh nhìn nè, em lấy lại hàm cũ nó chayj ne
        listUsers: state.admin.users
    };
}

const mapDispatchToProps = dispatch => {
    return {
        getGenderStart: () => dispatch(action.fetchGenderStart()),
        getPositionStart: () => dispatch(action.fetchPositionStart()),
        getRoleStart: () => dispatch(action.fetchRoleStart()),
        createNewUser: (data) => dispatch(action.createNewUser(data)),
        fetchUserRedux: () => dispatch(action.fetchAllUsersStart()),
        editUserRedux: (data) => dispatch(action.editUser(data))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);