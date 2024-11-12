pipeline {
    agent any
    environment {
        SSH_CREDENTIALS_ID = 'ssh-appen' 
    }
    stages {
        stage('SCP folder to remote server') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        scp -r -o StrictHostKeyChecking=no -i $SSH_KEY Front $SSH_USER@192.168.21.177:/var/www/site-interpromo-2024
                    '''
                }
            }
        }
    }
}