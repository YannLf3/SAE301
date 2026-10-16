<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\UtilisateurModel;
use PDOException;

/**
 * Connexion, création de compte, session courante et déconnexion (CMD-c).
 *
 * L'identité et le rôle de l'utilisateur connecté sont rangés en session,
 * côté serveur. Le client ne détient que l'identifiant de session, dans le
 * cookie PHPSESSID : il ne peut jamais choisir son rôle.
 */
final class AuthController
{
    private const MOT_DE_PASSE_MIN = 8;
    private const NOM_MAX = 80;
    private const EMAIL_MAX = 191;

    /**
     * Hash factice : permet de dépenser le même temps de calcul quand l'e-mail
     * est inconnu, pour ne pas révéler quels comptes existent.
     */
    private const HASH_FACTICE = '$2y$12$8L8fFx9m3FP7IpxYWHP7DO/WkpqV2TLnrEHTYUUh7inPmGHHMn11W';

    /** Le modèle qui interroge la base, fourni à la construction. */
    private UtilisateurModel $utilisateurs;

    public function __construct(UtilisateurModel $utilisateurs)
    {
        $this->utilisateurs = $utilisateurs;
    }

    /**
     * POST /api/login : ouvre la session si l'e-mail et le mot de passe sont bons.
     */
    public function login(Request $requete): void
    {
        $corps = $requete->corps();
        $email = $this->texte($corps, 'email');
        $mdp   = (string) ($corps['mdp'] ?? '');

        $utilisateur = $this->utilisateurs->trouverParEmail($email);
        $hash = $utilisateur === null ? self::HASH_FACTICE : $utilisateur['mot_de_passe_hash'];
        $valide = password_verify($mdp, $hash);

        // Même message dans les deux cas : on ne dit pas si l'e-mail existe.
        if ($utilisateur === null || !$valide) {
            Response::erreur('E-mail ou mot de passe invalide', 401);
        }

        $this->ouvrirSession($utilisateur['id'], $utilisateur['role']);

        Response::json(['connecte' => true, 'utilisateur' => $this->publique($utilisateur)]);
    }

    /**
     * POST /api/register : crée un compte client puis ouvre sa session.
     */
    public function register(Request $requete): void
    {
        $corps  = $requete->corps();
        $prenom = $this->texte($corps, 'prenom');
        $nom    = $this->texte($corps, 'nom');
        $email  = $this->texte($corps, 'email');
        $mdp    = (string) ($corps['mdp'] ?? '');

        $erreur = $this->validerInscription($prenom, $nom, $email, $mdp);
        if ($erreur !== null) {
            Response::erreur($erreur, 422);
        }

        if ($this->utilisateurs->emailExiste($email)) {
            Response::erreur('Un compte existe déjà avec cet e-mail', 409);
        }

        try {
            $id = $this->utilisateurs->creer($email, password_hash($mdp, PASSWORD_DEFAULT), $nom, $prenom);
        } catch (PDOException $e) {
            // Deux inscriptions simultanées : la contrainte UNIQUE tranche.
            // Le code SQLSTATE 23000 indique ici que l'e-mail existe déjà.
            if ($e->getCode() === '23000') {
                // 409 signifie que la demande entre en conflit avec un compte existant.
                Response::erreur('Un compte existe déjà avec cet e-mail', 409);
            }
            throw $e;
        }

        $this->ouvrirSession($id, 'client');

        Response::json([
            'connecte'    => true,
            'utilisateur' => ['id' => $id, 'email' => $email, 'nom' => $nom, 'prenom' => $prenom, 'role' => 'client'],
        ], 201);
    }

    /**
     * GET /api/me : l'utilisateur de la session courante, ou 401.
     */
    public function me(): void
    {
        $id = $_SESSION['utilisateur_id'] ?? null;
        $utilisateur = is_int($id) ? $this->utilisateurs->trouverParId($id) : null;

        if ($utilisateur === null) {
            Response::erreur('Non connecté', 401);
        }

        Response::json(['connecte' => true, 'utilisateur' => $utilisateur]);
    }

    /**
     * POST /api/logout : détruit la session côté serveur.
     */
    public function logout(): void
    {
        $_SESSION = [];                               // vide la copie en mémoire

        // Supprime le cookie, avec le chemin sous lequel il a été posé : celui
        // que index.php a réglé avant session_start().
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path'    => session_get_cookie_params()['path'],
        ]);

        session_destroy();                            // efface le fichier serveur

        Response::json(['connecte' => false]);
    }

    /**
     * Range l'identité en session sous un identifiant de session neuf.
     *
     * @param int $id Identifiant de l'utilisateur.
     * @param string $role Rôle lu en base, jamais fourni par le client.
     */
    private function ouvrirSession(int $id, string $role): void
    {
        // L'utilisateur devient authentifié : on détruit l'ancien identifiant de
        // session (true) pour qu'aucun identifiant connu avant ne donne accès.
        session_regenerate_id(true);

        $_SESSION['utilisateur_id'] = $id;
        $_SESSION['role']           = $role;
    }

    /**
     * Lit un champ texte du corps, sans espaces autour.
     *
     * @param array<string, mixed> $corps Corps JSON décodé.
     * @param string $cle Nom du champ.
     */
    private function texte(array $corps, string $cle): string
    {
        $valeur = $corps[$cle] ?? '';

        return is_string($valeur) ? trim($valeur) : '';
    }

    /**
     * Vérifie les champs d'inscription.
     *
     * @return string|null Message d'erreur, ou null si tout est valide.
     */
    private function validerInscription(string $prenom, string $nom, string $email, string $mdp): ?string
    {
        if ($prenom === '' || $nom === '') {
            return 'Le prénom et le nom sont obligatoires';
        }
        if (mb_strlen($prenom) > self::NOM_MAX || mb_strlen($nom) > self::NOM_MAX) {
            return 'Le prénom et le nom doivent faire ' . self::NOM_MAX . ' caractères au plus';
        }
        if (strlen($email) > self::EMAIL_MAX || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return 'Adresse e-mail invalide';
        }
        if (mb_strlen($mdp) < self::MOT_DE_PASSE_MIN) {
            return 'Le mot de passe doit faire au moins ' . self::MOT_DE_PASSE_MIN . ' caractères';
        }

        return null;
    }

    /**
     * Les champs d'un utilisateur que le client a le droit de connaître.
     *
     * @param array{id: int, email: string, nom: string, prenom: string, role: string} $utilisateur Ligne issue du modèle.
     * @return array{id: int, email: string, nom: string, prenom: string, role: string}
     */
    private function publique(array $utilisateur): array
    {
        return [
            'id'     => $utilisateur['id'],
            'email'  => $utilisateur['email'],
            'nom'    => $utilisateur['nom'],
            'prenom' => $utilisateur['prenom'],
            'role'   => $utilisateur['role'],
        ];
    }
}
