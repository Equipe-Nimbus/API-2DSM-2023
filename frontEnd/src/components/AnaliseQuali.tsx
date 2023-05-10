import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import verificaLogado from '../funcoes/verificaLogado';
import NavBar from './NavBar';
import { toast } from 'react-toastify';

interface Regra {
    reg_codigo: number
    reg_tipo: string
    reg_valor: string
    reg_obrigatoriedade: boolean
}

interface Analise {
    regra_tipo?: string
    regra_valor?: string
    avaria?: string
}

function AnaliseQuali() {
    const [regras, setRegras] = useState<Regra[]>([])
    const [analises, setAnalises] = useState<Analise[]>([])
    const [laudo, setLaudo] = useState('não')
    const [mudanca, setMudanca] = useState('')
    const { id } = useParams()

    const navigate = useNavigate()

    async function getRegras() {
        try {
            const response = await api.get(`/analiseQuali/${id}`)
            //console.log(response.data)
            const regras = response.data
            const padraoAnalises = regras.map((regra: Regra) => {
                if (regra.reg_tipo === 'Avaria') {
                    return {
                        tipo: regra.reg_tipo,
                        valor: 'false',
                        avaria: ''
                    }
                } else if (regra.reg_tipo === 'Personalizada') {
                    return {
                        tipo: regra.reg_tipo,
                        valor: 'false',
                    }
                } else {
                    return {
                        tipo: regra.reg_tipo,
                        valor: '',
                    }
                }
            })
            setAnalises(padraoAnalises)
            setRegras(regras)
        } catch (erro) {
            console.log(erro)
        }
    }

    async function veStatus() {
        let status = await api.post('/confereStatus', { id: id, acessando: 'Análise Qualitativa' })
        let dado = status.data
        console.log(dado)
        if (status.data === 'Primeira vez') {
            setMudanca('Primeira vez')
        }
        else if (status.data === 'Revisão') {
            setMudanca('Revisão')
        }
        else {
            setMudanca('Edição')
            let listaAnalises: any = []
            dado.map((analise: any, index: number) => {
                let linha = analise
                if (linha.regra_tipo === 'Avaria' && linha.avaria !== undefined) {
                    listaAnalises.push({ regra_tipo: linha.regra_tipo, regra_valor: linha.regra_valor, avaria: linha.avaria })
                }
                else {
                    listaAnalises.push({ regra_tipo: linha.regra_tipo, regra_valor: linha.regra_valor, avaria: '' })
                }
            })
            console.log('OIIII')
            console.log(listaAnalises)

            setAnalises(listaAnalises)
            console.log(analises)
        }


    }

    function manipularAvaria(index: number, comentario: string) {
        const analiseAvaria: Analise = {
            avaria: comentario
        }

        const analiseNova = [...analises]
        analiseNova[index].avaria = analiseAvaria.avaria
        setAnalises(analiseNova)
    }

    function manipularCheckboxAvaria(index: number, check: boolean) {
        const analiseAvaria: Analise = {
            regra_valor: check ? 'true' : 'false'
        }

        const analiseNova = [...analises]
        analiseNova[index].regra_valor = analiseAvaria.regra_valor
        setAnalises(analiseNova)

    }

    function manipularRegraPersonalizada(index: number, check: boolean) {
        const analiseRegra: Analise = {
            regra_valor: check ? 'true' : 'false'
        }
        const analiseNova = [...analises]
        analiseNova[index].regra_valor = analiseRegra.regra_valor
        setAnalises(analiseNova)

    }

    function manipularRegra(index: number, valor: string) {
        const analiseRegra = {
            valor: valor
        }

        const analiseNova = [...analises]
        analiseNova[index].regra_valor = analiseRegra.valor
        setAnalises(analiseNova)

    }

    function validaAnalises(acao: string) {
        const analisesNumericas = analises.filter((analise) => {
            return analise.regra_tipo !== 'Avaria' && analise.regra_tipo !== 'Personalizada'
        })
        if (acao === 'Continuar') {
            if (analisesNumericas.every((analise) => analise.regra_valor !== '')) {
                confirmaContinua()
            } else {
                toast.error('Preencha todas as análises.', {
                    position: 'bottom-left', autoClose: 2500,
                    className: 'flash', hideProgressBar: true, pauseOnHover: false, theme: "dark"
                })
            }
        } else if (acao === 'Voltar') {
            if (analisesNumericas.every((analise) => analise.regra_valor !== '')) {
                confirmaVoltaListagem()
            } else {
                toast.error('Preencha todas as análises.', {
                    position: 'bottom-left', autoClose: 2500,
                    className: 'flash', hideProgressBar: true, pauseOnHover: false, theme: "dark"
                })
            }
        }
    }

    async function confirmaVoltaListagem() {
        const post = { id, analises, laudo }
        navigate('/listaPedidos')
        await api.post('/postQualitativa', { post })
    }

    async function confirmaContinua() {
        const post = { id, analises, laudo }
        navigate(`/listaPedidos`) //substituir pela rota do relatório final, quando pronta
        await api.post('/postQualitativa', { post })

    }

    function cancelaVoltaListagem() {
        navigate('/listaPedidos')
    }

    function estado() {
        console.log(analises, laudo)
    }
    //================== Botões ==================
    function irQuantitativa() {
        navigate(`/analiseQuant/${id}`)
    }

    function irRegularizacao() {

    }




    useEffect(() => {
        async function veLogado() {
            let resultado = await verificaLogado()
            if (resultado.logado) {
                getRegras()
                if (resultado.funcao !== 'Administrador' && resultado.funcao !== 'Gerente') {
                    navigate('/listaPedidos')
                }
            } else {
                navigate('/')
            }
        }
        veLogado()
        veStatus()
    }, [])


    if (mudanca !== 'Revisão') {
        return (
            <>
                <NavBar />
                <form >
                    <div className="mainContent">
                        <div className="titleRegister">
                            <h1 className="mainTitle">ANÁLISE QUALITATIVA</h1>
                        </div>
                        {mudanca === 'Edição' &&
                            <button className='button-relatorio' type='button' onClick={irRegularizacao}>Relatório Final</button>
                        }

                        <button className='button' type='button' onClick={irQuantitativa}>Análise Quantitativa</button>
                        <div className='laudo'>
                            <input className='tipo-laudo' type="text" value={'Laudo'} readOnly /> <input className='haver' type="text" value={'Deve haver'} readOnly />
                            <input className='checkbox' type="checkbox" onChange={(evento) => setLaudo(laudo === 'sim' ? 'não' : 'sim')} />
                        </div>
                        {regras.map((regra, index) => {
                            if (regra.reg_tipo === 'Avaria') {
                                return (
                                    <div className='regra-avaria' key={index}>
                                        <input className='tipo-avaria' type="text" value={regra.reg_tipo} readOnly /> <input className='regra-valor' type="text" value={regra.reg_valor} readOnly />
                                        <input className='checkbox' type="checkbox" value={analises[index].regra_valor} onChange={(evento) => manipularCheckboxAvaria(index, evento.target.checked)} /> <br />
                                        <input className='descricao' type="text" placeholder='Descrição da Avaria' value={analises[index].avaria} onChange={(evento) => manipularAvaria(index, evento.target.value)} />
                                    </div>
                                )
                            } else if (regra.reg_tipo === 'Personalizada') {
                                return (
                                    <div className='regra-personalizar' key={index}>
                                        <input className='personalizar' type="text" value={regra.reg_tipo} readOnly /> <input className='regra-valor' type="text" value={regra.reg_valor} readOnly />
                                        <input className='checkbox' type="checkbox" value={analises[index].regra_valor} onChange={(evento) => manipularRegraPersonalizada(index, evento.target.checked)} />
                                    </div>
                                )

                            } else {
                                return (
                                    <div className='manipular' key={index}>
                                        <input className='tipo-regra' type="text" value={regra.reg_tipo} readOnly /> <input className='limitacao' type="text" value={regra.reg_valor} readOnly />
                                        <input className='manipular-regra' type="text" placeholder='Insira um Número' value={analises[index].regra_valor} onChange={(evento) => manipularRegra(index, evento.target.value)} required />
                                    </div>
                                )
                            }
                        })}
                        <div className='mesmalinha'>
                            <button type="button" onClick={cancelaVoltaListagem} className="cancel_button">Cancelar</button>
                            <button type="button" onClick={(evento) => validaAnalises('Continuar')} className="confirm_button">Confirmar</button>
                        </div>

                    </div>
                </form>
                <button onClick={(evento) => estado()}>ANALISES</button>
            </>
        )
    }
    else {
        return (
            <>
                <NavBar />
                <form >
                    <div className="mainContent">
                        <div className="titleRegister">
                            <h1 className="mainTitle">ANÁLISE QUALITATIVA</h1>
                        </div>
                        <button type='button' onClick={irRegularizacao}>Relatório Final</button>
                        <button type='button' onClick={irQuantitativa}>Análise Quantitativa</button>
                        <div>
                            <input type="text" value={'Laudo'} readOnly /> <input type="text" value={'Deve haver'} readOnly />
                            <input type="checkbox" value={laudo} onChange={(evento) => setLaudo(laudo === 'sim' ? 'não' : 'sim')} />
                        </div>
                        {regras.map((regra, index) => {
                            if (regra.reg_tipo === 'Avaria') {
                                return (
                                    <div key={index}>
                                        <input type="text" value={regra.reg_tipo} readOnly /> <input type="text" value={regra.reg_valor} readOnly />
                                        <input type="checkbox" value={analises[index].regra_valor} onChange={(evento) => manipularCheckboxAvaria(index, evento.target.checked)} /> <br />
                                        <input type="text" value={analises[index].regra_valor} onChange={(evento) => manipularAvaria(index, evento.target.value)} />
                                    </div>
                                )
                            } else if (regra.reg_tipo === 'Personalizada') {
                                return (
                                    <div key={index}>
                                        <input type="text" value={regra.reg_tipo} readOnly /> <input type="text" value={regra.reg_valor} readOnly />
                                        <input type="checkbox" value={analises[index].regra_valor} onChange={(evento) => manipularRegraPersonalizada(index, evento.target.checked)} />
                                    </div>
                                )

                            } else {
                                return (
                                    <div key={index}>
                                        <input type="text" value={regra.reg_tipo} readOnly /> <input type="text" value={regra.reg_valor} readOnly />
                                        <input type="text" value={analises[index].regra_valor} onChange={(evento) => manipularRegra(index, evento.target.value)} required />
                                    </div>
                                )
                            }
                        })
                        }
                        <div className='mesmalinha'>
                            <button type="button" onClick={cancelaVoltaListagem} className="cancel_button">Cancelar</button>
                            <button type="button" onClick={(evento) => validaAnalises('Continuar')} className="confirm_button">Confirmar</button>
                        </div>

                    </div>
                </form>
                <button onClick={(evento) => estado()}>ANALISES</button>
            </>
        )
    }

}
export default AnaliseQuali