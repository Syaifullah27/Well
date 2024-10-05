'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ModalBox from '@/ComponentsForConverter/ModalBox';
import PreviewFile from '@/ComponentsForConverter/previewFile';

// eslint-disable-next-line react/prop-types
export default function App({ isDarkMode }) {
    const [fileContent, setFileContent] = useState('');
    const [contactName, setContactName] = useState('contact');
    const [fileName, setFileName] = useState(''); 
    const [fileExample, setFileExample] = useState('');
    const [show, setShow] = useState(false);
    const [showPreview, setShowPreview] = useState(false); 
    const [selectedFileName, setSelectedFileName] = useState(''); 
    const [convertedFiles, setConvertedFiles] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const originalFileName = file.name;
            const baseName = originalFileName.replace(/\.[^/.]+$/, ''); 
            setFileName(`${baseName}.vcf`);

            setSelectedFileName(originalFileName);
            const reader = new FileReader();
            reader.onload = (e) => {
                const filteredContent = e.target.result
                    .split('\n')
                    .map(line => {
                        const cleanLine = line.replace(/AAA/g, '').trim();
                        if (/^\+?\d+$/.test(cleanLine)) {
                            return cleanLine;
                        }
                        return ''; 
                    })
                    .filter(line => line.trim() !== '');

                setFileContent(filteredContent.join('\n'));
                handleConvert(filteredContent.join('\n'), `${baseName}.vcf`); 
            };
            reader.readAsText(file);
        }
    };

    const handleContactNameChange = (event) => {
        setContactName(event.target.value);
    };

    const handleFileNameChange = (event) => {
        setFileName(event.target.value);
    };

    const convertToVcf = (content, fileName) => {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        let vcfContent = '';
        let contactNumber = 1;

        lines.forEach((line) => {
            vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${contactNumber}\nTEL:${line.trim()}\nEND:VCARD\n`;
            contactNumber++;
        });

        return {
            content: vcfContent,
            fileName: fileName,
            contactName: contactName
        };
    };

    const handleConvert = (content, newFileName) => {
        const convertedFile = convertToVcf(content || fileContent, newFileName || fileName);
        setConvertedFiles([...convertedFiles, convertedFile]);
    };

    const handleDownloadAll = () => {
        convertedFiles.forEach(file => {
            const blob = new Blob([file.content], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            let downloadFileName = file.fileName;
            if (downloadFileName.toLowerCase().endsWith('.vcf.vcf')) {
                downloadFileName = downloadFileName.slice(0, -4);
            } else if (!downloadFileName.toLowerCase().endsWith('.vcf')) {
                downloadFileName += '.vcf';
            }

            link.href = url;
            link.download = downloadFileName;
            link.click();
            URL.revokeObjectURL(url);
        });

        setConvertedFiles([]); 
    };

    const handleDeleteFile = (index) => {
        const updatedFiles = convertedFiles.filter((_, i) => i !== index);
        setConvertedFiles(updatedFiles);
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handlePreviewClose = () => setShowPreview(false);
    const handlePreviewShow = () => setShowPreview(true);

    useEffect(() => {
        axios.get('ExampleFile/onlyNumberWithAAA.txt', { responseType: 'text' })
            .then((response) => {
                setFileExample(response.data);
            })
            .catch((error) => {
                console.error("Error loading the default file:", error);
                setFileExample("Error loading file.");
            });
    }, []);

    return (
        <div className="border-2 border-[#dedede] bg-slate-200 rounded-lg p-4 h-max">
            <div className="pb-3">
                <h1 className={`font-bold text-xl pb-4 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Only Number with AAA</h1>
                <button
                    onClick={show ? handleClose : handleShow}
                    className="bg-blue-500 text-[#f5f5f5] p-2 px-2 rounded-md pb-2"
                >
                    {show ? 'Example File' : 'Example File'}
                </button>
                <p className="text-sm italic text-blue-800 pt-1">*Click the button to open file Example.</p>
                <ModalBox show={show} handleClose={handleClose} fileContent={fileExample} />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Contact Name
                    </label>
                    <input type="text" value={contactName} onChange={handleContactNameChange}
                        placeholder='Contact Name'
                        className='border border-[#dedede] p-2 rounded-md placeholder:text-sm text-gray-800' />
                </div>
                <div className='flex flex-col gap-2'>
                    <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        File Name
                    </label>
                    <input type="text" value={fileName} onChange={handleFileNameChange}
                        placeholder='File Name'
                        className='border border-[#dedede] p-2 rounded-md placeholder:text-sm text-gray-800' />
                </div>
            </div>
            <div className='flex flex-col gap-4 pt-7'>
                <div className="flex items-center gap-4 justify-between">
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        id="fileInput"
                        className="hidden"
                    />
                    <label
                        htmlFor="fileInput"
                        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
                    >
                        Choose File
                    </label>
                    <span
                        className={`text-sm text-gray-700 border border-[#cecece] flex justify-center items-center p-2 rounded-md cursor-pointer ${isDarkMode ? 'text-gray-200' : ''} ${selectedFileName ? 'hover:bg-gray-100' : 'cursor-not-allowed'}`}
                        onClick={selectedFileName ? handlePreviewShow : null}
                    >
                        {selectedFileName ? ` ${selectedFileName}` : 'No file selected'}
                    </span>

                </div>

                {convertedFiles.length > 0 && (
                    <div className="my-4">
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Converted Files</h2>
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-4 py-2 text-gray-700">File Name</th>
                                    <th className="px-4 py-2 text-gray-700">Contact Name</th>
                                    <th className="px-4 py-2 text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {convertedFiles.map((file, index) => (
                                    <tr key={index} className="bg-white text-gray-700">
                                        <td className="border px-4 py-2">{file.fileName}</td>
                                        <td className="border px-4 py-2">{file.contactName}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteFile(index)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <button
                    className="bg-green-500 text-white p-2 rounded-md"
                    onClick={handleDownloadAll}
                    disabled={convertedFiles.length === 0}
                >
                    Download All
                </button>
            </div>

            <PreviewFile show={showPreview} handleClose={handlePreviewClose} fileContent={fileContent} />
        </div>
    );
}

