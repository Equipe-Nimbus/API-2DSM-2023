import React from 'react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import { toast } from 'react-toastify';

interface Pedido{
    ped_produto_massa:string
}


function AnaliseQuant(){
    const [pesagem, setPesagem] = useState('')
    const [peso, setPeso] = useState('')
    const [tipoPeso, setTipoPeso] = useState('')
    const [mudanca, setMudanca] = useState('')

    async function getPeso(){
        try {
            let post = id
            const response = await api.post('/confereUnidade', {post})
            let dado = response.data.ped_produto_massa
            setPeso(dado)
            }
            catch (erro) {
            console.log(erro)
            }
    }

    async function veStatus() {
        await api.post('/confereStatus', {id:id, acessando:'Análise Quantitativa'}).then((response) => {
            let dado = response.data

            if (response.data === 'Primeira vez'){
                setMudanca('Primeira vez')
            }
            else if (response.data === 'Revisão'){
                setMudanca('Revisão')
            }
            else {
                setMudanca('Edição')
                setPesagem(dado.regra_valor)

            }
            
        }
        )}
        

    const {id} = useParams()
    const navegate = useNavigate()

    async function confiraTipoPeso(){
        if (peso.slice(-1) === 't'){
            setTipoPeso('Toneladas')
        }
        else{
            setTipoPeso('Quilogramas')
        }
    }

    // ====================== Mascara ======================

    function blurPesagem (evento:any){
        let valor = evento.target.value
        if(tipoPeso === 'Toneladas'){
            valor = valor + ' t'
        }
        else{
            valor = valor + ' kg'
        }
        setPesagem(valor)
    }

    function selectPesagem(evento:any){
        let valor = evento.target.value
        if(tipoPeso === 'Toneladas' && valor.slice(-1) === 't'){
            valor = valor.slice(0, -2)
        }
        else if(tipoPeso === 'Quilogramas' && valor.slice(-1) === 'g'){
            valor = valor.slice(0, -3)
        }
        setPesagem(valor)
    }

    function mudaPesagem(evento:any){
        console.log(evento.target.value)
        if(!isNaN(evento.target.value)){
            setPesagem(evento.target.value)
        }
        else{
            toast.error('Insira apenas números', {
                position: 'bottom-left',
                autoClose: 2500, className: 'flash', hideProgressBar: true, pauseOnHover: false, theme: "dark"
            })
        }
    }

    // ====================== Botões ======================

    async function confirmaVoltaListagem(){
        const post = {id, pesagem}
        navegate('/listaPedidos')
        await api.post('/postQuantitativa', {post})  
    }

    async function confirmaContinua() {
        if(pesagem !== '' && pesagem !== ' t' && pesagem !== ' kg'){
            const post = {id, pesagem}     
            await api.post('/postQuantitativa', { post }).then((response) =>{navegate(`/analiseQuali/${id}`)})
        }
        else{
            toast.error('Preencha todos os campos', {
                position: 'bottom-left',
                autoClose: 2500, className: 'flash', hideProgressBar: true, pauseOnHover: false, theme: "dark"
            })
        }
        
             
    }

    function irQualitativa(){
        navegate(`/analiseQuali/${id}`)
    }

    function irNotaFiscal(){
        navegate(`/recebePedido/${id}`)
    }

    function cancelaVoltaListagem(){
        navegate('/listaPedidos')
    }

    async function editaVolta(){
        const post = {id, pesagem}
        navegate('/listaPedidos')
        await api.post('/updateQuantitativa', { post })
    }

    //==================== useEffect ====================

    useEffect(() => {
        getPeso()
        confiraTipoPeso()
        veStatus()
        console.log(mudanca)
    },[mudanca])

    //==================== Render ====================

    if(mudanca !== 'Revisão'){
        return(
            <>
            <NavBar/>
            <div className="mainContent">
                <div className="titleRegister">
                    <h1 className="mainTitle">ANÁLISE QUANTITATIVA</h1>
                
                </div>
                {mudanca === 'Edição' &&
                    <button type='button' onClick={irQualitativa}>Análise Qualitativa</button>
                }
                <button type='button' onClick={irNotaFiscal}>Nota Fiscal</button>
                
                <div className="uni_quant">Unidade: {tipoPeso}
                </div>
                <div className='anaq1'>
                    <div className='anaq2'>
                        Resultado da pesagem:
                    </div>
                    <input type="text" className='input_form2' value={pesagem} 
                    onChange={(e) => {mudaPesagem(e)}}
                    onBlur={(e) =>{blurPesagem(e)}}
                    onSelect={(e) =>{selectPesagem(e)}}
                    required></input>
                </div>
                {mudanca === 'Primeira vez' &&
                    <>
                    <div className='mesmalinha'>
                        <button type="button" onClick={confirmaContinua} className="confirm_button">Confirmar</button>
                    </div>
                    <button type="button" onClick={cancelaVoltaListagem} className="cancel_button">Cancelar</button>
                    </>
                }
                {mudanca === 'Edição' &&
                    <>
                    <div className='mesmalinha'>
                        <button type="button" onClick={editaVolta} className="confirm_button">Editar</button>
                    </div>
                    <button type="button" onClick={cancelaVoltaListagem} className="cancel_button">Cancelar</button>
                    </>
                }
                
            </div>
            </>
        )
    }
    else{
        return(
            <>
            <NavBar/>
            <div className="mainContent">
                <div className="titleRegister">
                    <h1 className="mainTitle">ANÁLISE QUANTITATIVA</h1>
                
                </div>
                <button type='button' onClick={irQualitativa}>Análise Qualitativa</button>
                <button type='button' onClick={irNotaFiscal}>Nota Fiscal</button>
                <div className="uni_quant">Unidade: {tipoPeso}
                </div>
                <div className='anaq1'>
                    <div className='anaq2'>
                        Resultado da pesagem:
                    </div>
                    <input type="text" className='input_form2' value={pesagem} readOnly></input>
                </div>
                
                
                <button type="button" onClick={cancelaVoltaListagem} className="cancel_button">Voltar</button>    
            </div>
            </>

        )
        
            
        
    }
    
}

export default AnaliseQuant